const express = require('express');
const cors = require('cors');
const app = express();
const port = 5000;

// Cấu hình CORS
const corsOptions = {
  origin: 'https://memory-managerment-jamstack-back-end.vercel.app', // Cho phép miền front-end của bạn
  methods: ['GET', 'POST', 'OPTIONS'], // Cho phép các phương thức này
  allowedHeaders: ['Content-Type'], // Cho phép các header này
};

// Sử dụng CORS với các tùy chọn đã định nghĩa
app.use(cors());

// Xác minh các yêu cầu OPTIONS
//app.options('/allocate', cors(corsOptions));

app.use(express.json());



app.post('/allocate', (req, res) => {
  const { blockSizes, processSizes, allocationType } = req.body;
  
  let allocations = new Array(processSizes.length).fill(-1); // Lưu vị trí vùng nhớ được cấp phát cho từng tiến trình
  let fragmentations = []; // Mảng 2D lưu trữ trạng thái phân mảnh sau mỗi lần cấp phát
  let remainingBlocks = [...blockSizes]; // Lưu kích thước còn lại của các khối nhớ

  if (allocationType === 'first-fit') {
    processSizes.forEach((process, i) => {
      for (let j = 0; j < remainingBlocks.length; j++) {
        if (remainingBlocks[j] >= process) {
          allocations[i] = j;
          remainingBlocks[j] -= process;
          break;
        }
      }
      fragmentations.push([...remainingBlocks]); 
    });
  } else if (allocationType === 'best-fit') {
    processSizes.forEach((process, i) => {
      let bestIndex = -1;
      let minFragmentation = Infinity;
      for (let j = 0; j < remainingBlocks.length; j++) {
        if (remainingBlocks[j] >= process) {
          const fragmentation = remainingBlocks[j] - process;
          if (fragmentation < minFragmentation) {
            minFragmentation = fragmentation;
            bestIndex = j;
          }
        }
      }
      if (bestIndex !== -1) {
        allocations[i] = bestIndex;
        remainingBlocks[bestIndex] -= process;
      }
      fragmentations.push([...remainingBlocks]); 
    });
  } else if (allocationType === 'worst-fit') {
    processSizes.forEach((process, i) => {
      let worstIndex = -1;
      let maxFragmentation = -Infinity;
      for (let j = 0; j < remainingBlocks.length; j++) {
        if (remainingBlocks[j] >= process) {
          const fragmentation = remainingBlocks[j] - process;
          if (fragmentation > maxFragmentation) {
            maxFragmentation = fragmentation;
            worstIndex = j;
          }
        }
      }
      if (worstIndex !== -1) {
        allocations[i] = worstIndex;
        remainingBlocks[worstIndex] -= process;
      }
      fragmentations.push([...remainingBlocks]); 
    });
  } else if (allocationType === 'next-fit') {
    let lastAllocatedIndex = 0; // Lưu vị trí của khối bộ nhớ được cấp phát lần cuối
    processSizes.forEach((process, i) => {
      let allocated = false;
      for (let j = lastAllocatedIndex; j < remainingBlocks.length; j++) {
        if (remainingBlocks[j] >= process) {
          allocations[i] = j;
          remainingBlocks[j] -= process;
          lastAllocatedIndex = j + 1;//lưu lại vị trí vừa được cấp phát để tiến trình sau tiếp tục được cấp phát từ vị trí này
          allocated = true;
          break;
        }
      }
      // Nếu không tìm thấy từ vị trí cuối cùng, tìm tiếp từ đầu mảng
      if (!allocated) {
        for (let j = 0; j <= lastAllocatedIndex; j++) {
          if (remainingBlocks[j] >= process) {
            allocations[i] = j;
            remainingBlocks[j] -= process;
            lastAllocatedIndex = j + 1;
            allocated = true;
            break;
          }
        }
      }
      fragmentations.push([...remainingBlocks]);
    });
  } else if (allocationType === 'last-fit') {
    processSizes.forEach((process, i) => {
      for (let j = remainingBlocks.length - 1; j >= 0; j--) {
        if (remainingBlocks[j] >= process) {
          allocations[i] = j;
          remainingBlocks[j] -= process;
          break;
        }
      }
      fragmentations.push([...remainingBlocks]);
    });
  }

  res.json({ allocations, fragmentations, remainingBlocks });
});


app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
