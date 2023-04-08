// 引入转换库
const iconv = require("iconv-lite");
const csv = require("csvtojson");
const res = require("express/lib/response");

function tojs(csv_file) {
  var result = "";
  // 转换csv
  const converter = csv()
    .fromFile(csv_file, { encoding: "binary" })
    .then((json) => {
      //binary和fromFile中的文件读取方式要一致
      var buf = new Buffer(JSON.stringify(json), "binary"); //第一个参数格式是字符串
      var str = iconv.decode(buf, "GBK"); //原文编码我这是GBK
      str = JSON.parse(JSON.stringify(str)); //解码后为字符串，需要先转成json字符串
      var data = eval(str);
      return "data";
    })
    .then();
  return result;
}

module.exports = {
  tojs,
};
