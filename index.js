// server.js (Node.js Backend)
const express = require('express');
const cors = require('cors');
const app = express();
const port = 5000;
app.use(cors());
app.use(express.json());

app.post('/allocate', (req, res) => {
  
  const { blockSizes, processSizes, allocationType } = req.body;
  let allocations = new Array(processSizes.length).fill(-1);
  // Mảng 2D lưu trữ trạng thái phân mảnh sau mỗi lần cấp phát
  let fragmentations = [];
  
  // Mảng 1C lưu kích thước còn lại của khối nhớ mỗi khi được cấp phát cho tiến trình
  let remainingBlocks = [...blockSizes];

  if (allocationType === 'first-fit') {
    processSizes.forEach((process, i) => {
      for (let j = 0; j < remainingBlocks.length; j++) {
        //tìm kích thước nhớ đầu tiên >= kích thước tiến trình cấp phát
        if (remainingBlocks[j] >= process) {
          allocations[i] = j + 1;
          remainingBlocks[j] -= process;
          break;
        }
      }
      // Lưu trạng thái phân mảnh sau khi quá trình này được cấp phát
      fragmentations.push([...remainingBlocks]); 
    });
  } else if (allocationType === 'best-fit') {
    processSizes.forEach((process, i) => {
      let bestIndex = -1;
      let minFragmentation = Infinity;//lưu giá trị vùng nhớ được phân bổ thấp nhất
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
      // Lưu trạng thái phân mảnh sau khi quá trình này được cấp phát
      fragmentations.push([...remainingBlocks]); 
    });
  } else if (allocationType === 'worst-fit') {
    processSizes.forEach((process, i) => {
      let worstIndex = -1;
      let maxFragmentation = -Infinity;//lưu giá trị vùng nhớ được phân bổ cao nhất
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
      // Lưu trạng thái phân mảnh sau khi quá trình này được cấp phát
      fragmentations.push([...remainingBlocks]); 
    });
  }

  // server sẽ gửi về một phản hồi HTTP dưới dạng JSON cho client, trong đó có hai trường dữ liệu là allocations và fragmentations.
  res.json({ allocations, fragmentations });
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
