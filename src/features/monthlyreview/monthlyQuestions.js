// Monthly Review — 15 Câu Hỏi Phản Tư Theo Tháng

export const MONTHLY_CATEGORIES = {
  LOOKBACK: { id: 'lookback', label: 'Nhìn lại', icon: '🔍', color: '#6366f1' },
  EVALUATE: { id: 'evaluate', label: 'Đánh giá', icon: '⚖️', color: '#f59e0b' },
  NEXTMONTH: { id: 'nextmonth', label: 'Tháng tới', icon: '🚀', color: '#10b981' },
}

export const MONTHLY_QUESTIONS = [
  // Nhìn lại (8 câu)
  {
    id: 'mq1', number: 1, section: 'monthly',
    category: MONTHLY_CATEGORIES.LOOKBACK,
    question: 'Thành tựu lớn nhất của bạn trong tháng này là gì?',
    placeholder: 'Điều bạn tự hào nhất, dù lớn hay nhỏ...',
  },
  {
    id: 'mq2', number: 2, section: 'monthly',
    category: MONTHLY_CATEGORIES.LOOKBACK,
    question: 'Bạn đã thất bại hoặc vấp ngã như thế nào? Bạn rút ra được gì?',
    placeholder: 'Nhìn nhận trung thực về những điều chưa thành công...',
  },
  {
    id: 'mq3', number: 3, section: 'monthly',
    category: MONTHLY_CATEGORIES.LOOKBACK,
    question: 'Bài học quan trọng nhất bạn học được trong tháng này là gì?',
    placeholder: 'Điều gì đã thay đổi cách bạn suy nghĩ hoặc hành động...',
  },
  {
    id: 'mq4', number: 4, section: 'monthly',
    category: MONTHLY_CATEGORIES.LOOKBACK,
    question: 'Sức khoẻ thể chất và tinh thần của bạn tháng này như thế nào?',
    placeholder: 'Năng lượng, giấc ngủ, vận động, cảm xúc của bạn...',
  },
  {
    id: 'mq5', number: 5, section: 'monthly',
    category: MONTHLY_CATEGORIES.LOOKBACK,
    question: 'Các mối quan hệ của bạn tháng này phát triển ra sao?',
    placeholder: 'Kết nối với gia đình, bạn bè, đồng nghiệp...',
  },
  {
    id: 'mq6', number: 6, section: 'monthly',
    category: MONTHLY_CATEGORIES.LOOKBACK,
    question: 'Tình hình tài chính của bạn tháng này như thế nào?',
    placeholder: 'Thu nhập, chi tiêu, tiết kiệm, đầu tư...',
  },
  {
    id: 'mq7', number: 7, section: 'monthly',
    category: MONTHLY_CATEGORIES.LOOKBACK,
    question: 'Bạn đã phát triển kỹ năng hoặc kiến thức gì mới?',
    placeholder: 'Sách đã đọc, khóa học, kỹ năng mới học...',
  },
  {
    id: 'mq8', number: 8, section: 'monthly',
    category: MONTHLY_CATEGORIES.LOOKBACK,
    question: 'Khoảnh khắc ý nghĩa nhất của tháng này là gì?',
    placeholder: 'Khoảnh khắc khiến bạn mỉm cười khi nghĩ lại...',
  },
  // Đánh giá (4 câu)
  {
    id: 'mq9', number: 9, section: 'monthly',
    category: MONTHLY_CATEGORIES.EVALUATE,
    question: 'Điều bạn hài lòng nhất về bản thân tháng này là gì?',
    placeholder: 'Hành động, quyết định, hay cách bạn đối xử với người khác...',
  },
  {
    id: 'mq10', number: 10, section: 'monthly',
    category: MONTHLY_CATEGORIES.EVALUATE,
    question: 'Điều bạn muốn thay đổi hoặc làm khác đi trong tháng tới là gì?',
    placeholder: 'Thói quen, cách tiếp cận, hay thái độ cần điều chỉnh...',
  },
  {
    id: 'mq11', number: 11, section: 'monthly',
    category: MONTHLY_CATEGORIES.EVALUATE,
    question: 'Thói quen nào bạn đã duy trì tốt? Thói quen nào bạn muốn cải thiện?',
    placeholder: 'Đánh giá các thói quen hàng ngày và hàng tuần của bạn...',
  },
  {
    id: 'mq12', number: 12, section: 'monthly',
    category: MONTHLY_CATEGORIES.EVALUATE,
    question: 'Bạn đã sử dụng thời gian có hiệu quả không? Điều gì chiếm nhiều thời gian nhất?',
    placeholder: 'Nhìn lại cách bạn phân bổ thời gian trong tháng...',
  },
  // Tháng tới (3 câu)
  {
    id: 'mq13', number: 13, section: 'monthly',
    category: MONTHLY_CATEGORIES.NEXTMONTH,
    question: 'Mục tiêu quan trọng nhất bạn muốn đạt được trong tháng tới là gì?',
    placeholder: 'Mục tiêu cụ thể, đo lường được, có thời hạn...',
  },
  {
    id: 'mq14', number: 14, section: 'monthly',
    category: MONTHLY_CATEGORIES.NEXTMONTH,
    question: 'Ưu tiên hàng đầu của bạn trong tháng tới là gì? Bạn sẽ tập trung vào điều gì nhất?',
    placeholder: 'Điều quan trọng nhất cần hoàn thành...',
  },
  {
    id: 'mq15', number: 15, section: 'monthly',
    category: MONTHLY_CATEGORIES.NEXTMONTH,
    question: 'Bạn cam kết thay đổi hoặc bắt đầu điều gì trong tháng tới?',
    placeholder: 'Một thói quen mới, một hành động cụ thể, một cam kết với bản thân...',
  },
]

export const TOTAL_MONTHLY_QUESTIONS = MONTHLY_QUESTIONS.length
