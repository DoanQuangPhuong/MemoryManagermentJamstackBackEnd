// server.js (Node.js Backend)
const express = require('express');
const cors = require('cors');
const app = express();
const port = 5000;
app.use(cors());
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
          allocations[i] = j + 1;
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
        allocations[i] = bestIndex + 1;
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
        allocations[i] = worstIndex + 1;
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
          allocations[i] = j + 1;
          remainingBlocks[j] -= process;
          lastAllocatedIndex = j;
          allocated = true;
          break;
        }
      }
      if (!allocated) {
        for (let j = 0; j < lastAllocatedIndex; j++) {
          if (remainingBlocks[j] >= process) {
            allocations[i] = j + 1;
            remainingBlocks[j] -= process;
            lastAllocatedIndex = j;
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
          allocations[i] = j + 1;
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
