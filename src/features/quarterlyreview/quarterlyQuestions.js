// Quarterly Review — 20 Câu Hỏi Phản Tư Theo Quý

export const QUARTERLY_CATEGORIES = {
  EVALUATE: { id: 'qevaluate', label: 'Đánh giá Quý', icon: '📊', color: '#6366f1' },
  ANALYZE:  { id: 'qanalyze',  label: 'Phân tích',    icon: '🔬', color: '#f59e0b' },
  NEXTQTR:  { id: 'qnext',     label: 'Quý tới',      icon: '🎯', color: '#10b981' },
}

export const QUARTERLY_QUESTIONS = [
  // Đánh giá Quý (10 câu)
  {
    id: 'qq1', number: 1, section: 'quarterly',
    category: QUARTERLY_CATEGORIES.EVALUATE,
    question: 'Bạn đã đạt được những mục tiêu OKR nào trong quý này?',
    placeholder: 'Liệt kê các mục tiêu đã hoàn thành, một phần hoặc không đạt...',
  },
  {
    id: 'qq2', number: 2, section: 'quarterly',
    category: QUARTERLY_CATEGORIES.EVALUATE,
    question: 'Thành tựu lớn nhất và thất bại đáng nhớ nhất của quý này là gì?',
    placeholder: 'Nhìn nhận trung thực cả hai phía...',
  },
  {
    id: 'qq3', number: 3, section: 'quarterly',
    category: QUARTERLY_CATEGORIES.EVALUATE,
    question: 'Những thử thách lớn nhất bạn đã đối mặt trong quý này là gì?',
    placeholder: 'Rào cản bên trong và bên ngoài bạn đã vượt qua hoặc chưa vượt qua...',
  },
  {
    id: 'qq4', number: 4, section: 'quarterly',
    category: QUARTERLY_CATEGORIES.EVALUATE,
    question: 'Tình hình tài chính của bạn trong quý này như thế nào? So với mục tiêu đặt ra?',
    placeholder: 'Thu nhập, chi tiêu, tiết kiệm, đầu tư...',
  },
  {
    id: 'qq5', number: 5, section: 'quarterly',
    category: QUARTERLY_CATEGORIES.EVALUATE,
    question: 'Sức khoẻ và năng lượng của bạn trong quý này ở mức nào?',
    placeholder: 'Thể chất, tinh thần, thói quen luyện tập và dinh dưỡng...',
  },
  {
    id: 'qq6', number: 6, section: 'quarterly',
    category: QUARTERLY_CATEGORIES.EVALUATE,
    question: 'Các mối quan hệ quan trọng của bạn phát triển như thế nào trong quý này?',
    placeholder: 'Gia đình, bạn bè, đối tác, đội nhóm...',
  },
  {
    id: 'qq7', number: 7, section: 'quarterly',
    category: QUARTERLY_CATEGORIES.EVALUATE,
    question: 'Bạn đã phát triển bản thân như thế nào? Kỹ năng, kiến thức nào bạn đã nâng cao?',
    placeholder: 'Học tập, đào tạo, sách, khóa học, trải nghiệm mới...',
  },
  {
    id: 'qq8', number: 8, section: 'quarterly',
    category: QUARTERLY_CATEGORIES.EVALUATE,
    question: 'Quyết định quan trọng nhất bạn đã đưa ra trong quý là gì? Kết quả ra sao?',
    placeholder: 'Phân tích quyết định và tác động của nó...',
  },
  {
    id: 'qq9', number: 9, section: 'quarterly',
    category: QUARTERLY_CATEGORIES.EVALUATE,
    question: 'Thói quen nào bạn đã xây dựng hoặc phá bỏ trong quý này?',
    placeholder: 'Thói quen tốt và xấu, thay đổi hành vi...',
  },
  {
    id: 'qq10', number: 10, section: 'quarterly',
    category: QUARTERLY_CATEGORIES.EVALUATE,
    question: 'Bài học quan trọng nhất bạn học được trong quý này là gì?',
    placeholder: 'Điều cốt lõi thay đổi cách bạn suy nghĩ và hành động...',
  },
  // Phân tích (5 câu)
  {
    id: 'qq11', number: 11, section: 'quarterly',
    category: QUARTERLY_CATEGORIES.ANALYZE,
    question: 'Điểm mạnh nào của bạn đã phát huy tốt trong quý này?',
    placeholder: 'Năng lực, kỹ năng, tố chất bạn đã tận dụng hiệu quả...',
  },
  {
    id: 'qq12', number: 12, section: 'quarterly',
    category: QUARTERLY_CATEGORIES.ANALYZE,
    question: 'Điểm yếu nào đã cản trở bạn? Bạn muốn cải thiện điều gì?',
    placeholder: 'Những hạn chế cần nhận diện và khắc phục...',
  },
  {
    id: 'qq13', number: 13, section: 'quarterly',
    category: QUARTERLY_CATEGORIES.ANALYZE,
    question: 'Cơ hội nào bạn đã nắm bắt hoặc bỏ lỡ trong quý này?',
    placeholder: 'Những cơ hội xuất hiện và cách bạn phản ứng...',
  },
  {
    id: 'qq14', number: 14, section: 'quarterly',
    category: QUARTERLY_CATEGORIES.ANALYZE,
    question: 'Rủi ro hay mối đe dọa nào bạn đã phải đối phó? Bạn có chuẩn bị tốt không?',
    placeholder: 'Những bất ngờ, thử thách từ bên ngoài...',
  },
  {
    id: 'qq15', number: 15, section: 'quarterly',
    category: QUARTERLY_CATEGORIES.ANALYZE,
    question: 'Xu hướng nào trong cuộc sống hoặc công việc bạn nhận thấy qua 3 tháng qua?',
    placeholder: 'Pattern, xu hướng lặp lại, tín hiệu cần chú ý...',
  },
  // Quý tới (5 câu)
  {
    id: 'qq16', number: 16, section: 'quarterly',
    category: QUARTERLY_CATEGORIES.NEXTQTR,
    question: 'Mục tiêu OKR cho quý tới của bạn là gì?',
    placeholder: 'Objectives rõ ràng và Key Results đo lường được...',
  },
  {
    id: 'qq17', number: 17, section: 'quarterly',
    category: QUARTERLY_CATEGORIES.NEXTQTR,
    question: 'Chiến lược chính bạn sẽ thực hiện trong quý tới là gì?',
    placeholder: 'Cách tiếp cận, phương pháp, chiến thuật...',
  },
  {
    id: 'qq18', number: 18, section: 'quarterly',
    category: QUARTERLY_CATEGORIES.NEXTQTR,
    question: 'Ưu tiên hàng đầu trong quý tới là gì? Bạn sẽ tập trung vào điều gì nhất?',
    placeholder: 'Điều quan trọng nhất xứng đáng được ưu tiên...',
  },
  {
    id: 'qq19', number: 19, section: 'quarterly',
    category: QUARTERLY_CATEGORIES.NEXTQTR,
    question: 'Điều gì bạn cần thay đổi hoặc loại bỏ trong quý tới?',
    placeholder: 'Thói quen, cách làm, người/thứ tiêu tốn năng lượng...',
  },
  {
    id: 'qq20', number: 20, section: 'quarterly',
    category: QUARTERLY_CATEGORIES.NEXTQTR,
    question: 'Cam kết lớn nhất bạn muốn giữ với bản thân trong quý tới là gì?',
    placeholder: 'Một lời hứa cụ thể, đo lường được với chính mình...',
  },
]

export const TOTAL_QUARTERLY_QUESTIONS = QUARTERLY_QUESTIONS.length
