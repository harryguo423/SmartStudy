const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;
const DATA_DIR = path.join(__dirname, "data"); // 词表存放目录

// 确保data文件夹存在
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

app.use(express.static("public"));
app.use(express.json()); // 解析JSON请求体

// 新增：获取所有词表列表（data文件夹下的json文件）
app.get("/api/vocab-lists", (req, res) => {
  try {
    const files = fs.readdirSync(DATA_DIR);
    // 筛选出json格式文件，排除临时文件
    const vocabLists = files.filter(file => path.extname(file) === ".json")
      .map(file => ({
        name: file, // 文件名（如20250823_125738.json）
        label: file.replace(".json", "") // 下拉框显示名称（去除.json）
      }));
    res.json(vocabLists);
  } catch (err) {
    res.status(500).json({ error: "读取词表列表失败" });
  }
});

// 原有：根据选择的词表获取单词数据
app.get("/api/words", (req, res) => {
  const { vocabName } = req.query; // 接收选中的词表名
  if (!vocabName) {
    return res.status(400).json({ error: "请选择词表" });
  }
  const dataPath = path.join(DATA_DIR, vocabName);
  try {
    const data = JSON.parse(fs.readFileSync(dataPath, "utf-8"));
    res.json(data);
  } catch (err) {
    res.status(404).json({ error: "词表文件不存在" });
  }
});

// 新增：创建新词表（保存临时词表为json文件）
app.post("/api/create-vocab", (req, res) => {
  const { words } = req.body;
  if (!words || !Array.isArray(words) || words.length === 0) {
    return res.status(400).json({ error: "临时词表不能为空" });
  }
  // 生成文件名：20250823_125738.json（日期+时分秒）
  const now = new Date();
  const dateStr = now.getFullYear().toString().padStart(4, "0") +
    (now.getMonth() + 1).toString().padStart(2, "0") +
    now.getDate().toString().padStart(2, "0");
  const timeStr = now.getHours().toString().padStart(2, "0") +
    now.getMinutes().toString().padStart(2, "0") +
    now.getSeconds().toString().padStart(2, "0");
  const fileName = `${dateStr}_${timeStr}.json`;
  const filePath = path.join(DATA_DIR, fileName);

  try {
    fs.writeFileSync(filePath, JSON.stringify(words, null, 2), "utf-8");
    res.json({ success: true, vocabName: fileName }); // 返回新生成的词表名
  } catch (err) {
    res.status(500).json({ error: "创建词表失败" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});