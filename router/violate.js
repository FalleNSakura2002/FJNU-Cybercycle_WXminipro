// 建立路由
const express = require("express");
const router = express.Router();
// const multer = require("multer");
const request = require("request");
const fs = require("fs");

// // 初始化存储器
// const storage = multer.diskStorage({
//   //保存路径
//   destination: function (req, file, cb) {
//     cb(null, "./tmp/my-uploads");
//   },
//   //保存在 destination 中的文件名
//   filename: function (req, file, cb) {
//     cb(null, Date.now() + ".png");
//   },
// });
// const upload = multer({ storage: storage });

// 导入数据库
const {
  user_info,
  cycle_info,
  course_scheme,
  monitor_video,
  violate,
  violate_img,
} = require("../db");
const { Op, where } = require("sequelize");

// 上传违章事件与图片
router.post("/Report", async (req, res) => {
  // 随机组成事件编号
  var randID = Math.floor(Math.random() * 100);
  // 获取事件信息
  var wxid = req.headers["x-wx-openid"];
  console.log(wxid);
  var violate_id = String(Date.now()) + String(randID);
  var violate_lic = req.body.violate_lic;
  var violate_loc = req.body.violate_loc;
  // 将事件写入数据库
  await violate.create({
    violate_id: violate_id,
    violate_lic_num: violate_lic,
    violate_loc: violate_loc,
    violate_reporter_wxid: wxid,
    violate_res: "",
    violate_judge: "",
  });
  // 将图片相关信息写入数据库
  await violate_img.create({
    violate_id: violate_id,
    violate_img_dir: "/violate/" + violate_id + ".jpg",
  });
  // 获取缓存地址并上传
  const files = req.files.file.tempFilePath;
  gettoken(violate_id, files);
  // 返回报文
  res.send({ result: "上传成功" });
});

// 随机抽取一件未处理完的事件
router.get("/RandomPendingEvent", async (req, res) => {
  // 获取所有待处理事件
  const PendingEvents = await violate.findAll({
    attributes: ["violate_id", "violate_lic_num", "violate_loc"],
    where: {
      violate_res: "",
    },
  });
  // 抽取随机事件
  var randID = Math.floor(Math.random() * PendingEvents.length);
  res.send(PendingEvents[randID]);
});

// 抽取指定数量的最近违章事件
router.get("/RecentEvents", async (req, res) => {
  // 需要求取的事件数量
  var Event_number = req.query.Event_number;
  // 获取所有违章事件
  const Events = await violate.findAll({
    attributes: ["violate_id", "violate_lic_num", "violate_loc", "createdAt"],
    where: {
      violate_res: "Y",
    },
    order: [["createdAt", "DESC"]],
  });
  // 对比违章事件数量与需要求取的数量
  RandEvents = [];
  if (Events.length < Event_number) {
    // 当违章事件数量少于请求量，全部输出
    RandEvents = Events;
  } else {
    // 当违章事件数量多于请求量，抽取输出
    // 抽取事件
    for (i = 0; i < Event_number; i++) {
      RandEvents.push(Events[i]);
    }
  }
  // 重组信息
  for (i = 0; i < RandEvents.length; i++) {
    // 对应违章车牌查询学号
    var cycle_user = await cycle_info.findOne({
      attributes: ["cycle_user_id"],
      where: {
        cycle_lic_num: RandEvents[i].violate_lic_num,
      },
    });
    var cycle_user_id = cycle_user.cycle_user_id;
    // 对应学号查询信息
    var cycle_user_info = await user_info.findOne({
      attributes: ["user_name", "user_academy", "user_class_name"],
      where: {
        user_id: cycle_user_id,
      },
    });
    // 补全回报报文
    RandEvents[i].user_id = cycle_user_id;
    RandEvents[i].user_name = cycle_user_info.user_name;
    RandEvents[i].user_academy = cycle_user_info.user_academy;
    RandEvents[i].user_class_name = cycle_user_info.user_class_name;
  }
  res.send(RandEvents);
});

// 请求某个位置的违章次数信息
router.get("/NumOfLocEvents", async (req, res) => {
  // 查询事件时间
  var time_start = req.query.time + "T00:00:00.000Z";
  var time_end = req.query.time + "T24:00:00.000Z";
  var locs = [
    "桃李园",
    "文化街",
    "花香园",
    "百草园",
    "随园",
    "桃苑",
    "李苑",
    "桂苑",
    "榕园",
    "兰苑",
    "知明楼",
    "笃行楼",
    "立诚楼",
    "致广楼",
    "其它",
  ];
  // 获取所有违章事件车牌
  var AcademyEvents = await violate.findAll({
    attributes: ["violate_loc"],
    where: {
      violate_res: "Y",
      createdAt: {
        [Op.between]: [time_start, time_end],
      },
    },
  });
  // 返回报文
  loc_res = [];
  for (let i = 0; i < locs.length; i++) {
    // 统计个数
    loc_violate_count = 0;
    for (let j = 0; j < AcademyEvents.length; j++) {
      if (locs[i] == AcademyEvents[j].violate_loc) {
        loc_violate_count += 1;
      }
    }
    loc_res.push({
      violate_time: req.query.time,
      violate_loc: locs[i],
      violate_event_num: loc_violate_count,
    });
  }
  res.send(loc_res);
});

// 请求所有学院的违章次数信息
router.get("/NumOfAcademyEvents", async (req, res) => {
  // 查询事件时间
  var time_start = req.query.time + "T00:00:00.000Z";
  var time_end = req.query.time + "T24:00:00.000Z";
  academys = [
    "心理学院",
    "经济学院",
    "法学院",
    "马克思主义学院",
    "传播学院",
    "社会历史学院",
    "文化旅游与公共管理学院",
    "体育科学学院",
    "音乐学院",
    "美术学院",
    "数学与统计学院",
    "计算机与网络空间安全学院",
    "物理与能源学院",
    "光电与信息工程学院",
    "化学与材料学院",
    "环境与资源学院",
    "地理科学学院",
    "生命科学学院",
    "海外教育学院",
  ];
  // 获取所有违章事件车牌
  var AcademyEvents = await violate.findAll({
    attributes: ["violate_lic_num", "violate_id"],
    where: {
      violate_res: "Y",
      createdAt: {
        [Op.between]: [time_start, time_end],
      },
    },
  });
  // 将车牌号转为对应的学院
  var academy_list = [];
  for (let i = 0; i < AcademyEvents.length; i++) {
    // 查询对应的学号
    user_id = await cycle_info.findOne({
      attributes: ["cycle_user_id"],
      where: {
        cycle_lic_num: AcademyEvents[i].violate_lic_num,
      },
    });
    // 根据学号查询学院
    violate_academy = await user_info.findOne({
      attributes: ["user_academy"],
      where: {
        user_id: user_id.cycle_user_id,
      },
    });
    // 根据结果构成违章学院
    academy_list.push(violate_academy.user_academy);
  }
  // 统计违章信息
  var academy_res = []; // 返回报文
  for (let i = 0; i < academys.length; i++) {
    var violate_count = 0;
    for (let j = 0; j < academy_list.length; j++) {
      if (academys[i] == academy_list[j]) {
        violate_count += 1;
      }
    }
    academy_res.push({
      violate_time: req.query.time,
      academy_name: academys[i],
      academy_event_num: violate_count,
    });
  }
  res.send(academy_res);
});

// 更新违章信息
router.post("/EventUpdate", async (req, res) => {
  // 获取事件ID
  var EventID = req.body.eventID;
  var EventJug = req.body.eventJug;
  // 根据事件ID获取原有事件情况
  const eventOld = await violate.findOne({
    attributes: ["violate_id", "violate_judge"],
    where: {
      violate_id: EventID,
    },
  });
  // 更新事件情况
  var EventJug = eventOld.violate_judge + String(EventJug) + "_";

  // 检查是否需要更新事件评判结果
  EventSituation = EventJug.split("_");
  var Y = 0;
  var N = 0;
  //// 统计Y和N个数
  for (let i = 0; i < EventSituation.length; i++) {
    if (EventSituation[i] == "Y") {
      Y += 1;
    } else if (EventSituation[i] == "N") {
      N += 1;
    }
  }
  //// 如果有两个Y或两个N，则更新评判结果
  if (Y == 2) {
    await violate.update(
      { violate_res: "Y", violate_judge: EventJug },
      {
        where: {
          violate_id: EventID,
        },
      }
    );
  } else if (N == 2) {
    await violate.update(
      { violate_res: "N", violate_judge: EventJug },
      {
        where: {
          violate_id: EventID,
        },
      }
    );
  } else {
    await violate.update(
      { violate_judge: EventJug },
      {
        where: {
          violate_id: EventID,
        },
      }
    );
  }
  res.send({ result: "事件已更新！" });
});

//测试用接口
router.get("/test", async (req, res) => {
  const resu = await violate.findAll({
    where: {
      createdAt: {
        [Op.between]: [time_start, time_end],
      },
    },
  });
  res.send(resu);
});

//
module.exports = router;

// 一个请求token的方法
async function gettoken(violate_id, violate_pic) {
  const file_name = "violate/" + violate_id + ".jpg";
  request(
    {
      url: "https://api.weixin.qq.com/tcb/uploadfile",
      method: "POST",
      json: true,
      headers: {
        "content-type": "application/json",
      },
      body: {
        env: "prod-1g5f3zj4b8b3d1db",
        path: file_name,
      },
    },
    function (error, response, body) {
      if (!error && response.statusCode == 200) {
        console.log(body);
        postfile(body, file_name, violate_pic);
      }
    }
  );
}
// 一个上传数据的方法
async function postfile(token, file_name, violate_pic) {
  const formData = {
    key: file_name,
    Signature: token.authorization,
    "x-cos-security-token": token.token,
    "x-cos-meta-fileid": token.cos_file_id,
    file: fs.createReadStream(violate_pic),
  };
  request(
    {
      url: token.url,
      method: "POST",
      headers: { "Content-Type": "multipart/form-data" },
      formData: formData,
    },
    function (error, response, body) {
      if (!error && response.statusCode == 200) {
        console.log(body);
      } else {
        console.log(body);
      }
    }
  );
}
