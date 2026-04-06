import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../../shared/lib/supabase'

export default function useSharing() {
  const [userId, setUserId] = useState(null)
  const [myShares, setMyShares] = useState([])           // shares tôi đã gửi
  const [sharedWithMe, setSharedWithMe] = useState([])   // invites tôi nhận được
  const [loading, setLoading] = useState(false)

  // Auth tracking
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserId(session?.user?.id ?? null)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUserId(session?.user?.id ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  const loadShares = useCallback(async (uid) => {
    if (!uid) return
    setLoading(true)
    const { data, error } = await supabase
      .from('shares')
      .select(`
        *,
        owner:owner_id ( id, email, raw_user_meta_data ),
        recipient:shared_with_id ( id, email, raw_user_meta_data )
      `)
      .or(`owner_id.eq.${uid},shared_with_id.eq.${uid}`)
      .order('created_at', { ascending: false })
    setLoading(false)
    if (error) { console.error('Error loading shares:', error.message); return }
    setMyShares((data || []).filter(s => s.owner_id === uid))
    setSharedWithMe((data || []).filter(s => s.shared_with_id === uid))
  }, [])

  useEffect(() => {
    if (userId) loadShares(userId)
    else { setMyShares([]); setSharedWithMe([]) }
  }, [userId, loadShares])

  /**
   * Send an invite to a user by email for given features.
   * features: array of 'wheel' | 'dreamboard' | 'bucketlist'
   */
  const sendInvite = useCallback(async (email, features) => {
    if (!userId) return { error: 'Bạn cần đăng nhập để chia sẻ.' }
    // Look up user by email via profiles or auth (limited access)
    // We use a Postgres function or fallback to email field on auth.users (not accessible client-side)
    // Instead, we'll find them via existing profiles using the email on the auth.users metadata only if exposed.
    // Simple approach: insert with email hint, resolve via Edge Function in v2.
    // For v1, we search for a user profile with matching email using the shared lookup RPC.
    const { data: targetUser, error: lookupError } = await supabase
      .from('profiles')
      .select('id')
      .ilike('email', email)
      .maybeSingle()
    
    // Fallback: try auth admin (not available client-side)
    // If profiles doesn't have email column, we need to add it.
    if (lookupError || !targetUser) {
      // Try alternate: look up by a custom user lookup RPC or return a pending email invite
      return { error: `Không tìm thấy người dùng với email "${email}". Họ cần đăng ký tài khoản trước.` }
    }
    if (targetUser.id === userId) return { error: 'Bạn không thể chia sẻ với chính mình.' }

    const inserts = features.map(feature => ({
      owner_id: userId,
      shared_with_id: targetUser.id,
      feature,
      status: 'pending',
    }))

    const { error } = await supabase.from('shares').upsert(inserts, { onConflict: 'owner_id,shared_with_id,feature' })
    if (error) return { error: error.message }
    await loadShares(userId)
    return { success: true }
  }, [userId, loadShares])

  const acceptInvite = useCallback(async (shareId) => {
    const { error } = await supabase.from('shares').update({ status: 'accepted' }).eq('id', shareId).eq('shared_with_id', userId)
    if (error) { console.error(error.message); return }
    await loadShares(userId)
  }, [userId, loadShares])

  const rejectInvite = useCallback(async (shareId) => {
    const { error } = await supabase.from('shares').update({ status: 'rejected' }).eq('id', shareId).eq('shared_with_id', userId)
    if (error) { console.error(error.message); return }
    await loadShares(userId)
  }, [userId, loadShares])

  const revokeShare = useCallback(async (shareId) => {
    const { error } = await supabase.from('shares').delete().eq('id', shareId).eq('owner_id', userId)
    if (error) { console.error(error.message); return }
    setMyShares(prev => prev.filter(s => s.id !== shareId))
  }, [userId])

  /**
   * Get list of friends who accepted at least one share from me.
   */
  const acceptedFriends = myShares
    .filter(s => s.status === 'accepted')
    .reduce((acc, s) => {
      const existing = acc.find(f => f.id === s.shared_with_id)
      if (!existing) acc.push({ id: s.shared_with_id, recipient: s.recipient, features: [s.feature] })
      else existing.features.push(s.feature)
      return acc
    }, [])

  /**
   * Get list of friends who shared with me (accepted).
   */
  const friendsSharedWithMe = sharedWithMe
    .filter(s => s.status === 'accepted')
    .reduce((acc, s) => {
      const existing = acc.find(f => f.id === s.owner_id)
      if (!existing) acc.push({ id: s.owner_id, owner: s.owner, features: [s.feature] })
      else existing.features.push(s.feature)
      return acc
    }, [])

  const pendingInvites = sharedWithMe.filter(s => s.status === 'pending')

  return {
    userId,
    myShares,
    sharedWithMe,
    pendingInvites,
    acceptedFriends,
    friendsSharedWithMe,
    loading,
    sendInvite,
    acceptInvite,
    rejectInvite,
    revokeShare,
  }
}
