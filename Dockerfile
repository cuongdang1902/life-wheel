# Sử dụng node image chính thức
FROM node:20-alpine

# Thiết lập thư mục làm việc
WORKDIR /app

# Copy các file quản lý phụ thuộc
COPY package*.json ./

# Cài đặt các thư viện
RUN npm install

# Copy toàn bộ mã nguồn vào container
COPY . .

# Mở cổng mặc định của Vite (5173)
EXPOSE 5173

# Chạy ứng dụng ở chế độ dev, lắng nghe trên tất cả các host
CMD ["npm", "run", "dev", "--", "--host"]
