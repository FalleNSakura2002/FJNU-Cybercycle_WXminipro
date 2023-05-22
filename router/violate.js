// 建立路由
const express = require("express");
const router = express.Router();
const multer = require("multer");

// 初始化存储器
const storage = multer.diskStorage({
  //保存路径
  destination: function (req, file, cb) {
    cb(null, "./tmp/my-uploads");
  },
  //保存在 destination 中的文件名
  filename: function (req, file, cb) {
    cb(null, Date.now() + ".png");
  },
});
const upload = multer({ storage: storage });

// 导入数据库
const {
  user_info,
  cycle_info,
  course_scheme,
  monitor_video,
  violate,
  violate_img,
} = require("../db");
const { Op } = require("sequelize");

// 上传违章事件与图片
router.post("/Report", upload.single("photo", 12), async (req, res) => {
  // 随机组成事件编号
  var randID = Math.floor(Math.random() * 100);
  // 获取事件信息
  var wxid = req.headers["x-wx-openid"];
  var violate_id = String(Date.now()) + String(randID);
  var violate_lic = req.body.violate_lic;
  var violate_loc = req.body.violate_loc;
  var violate_img_name = req.file.filename;
  // 将事件写入数据库
  await violate.create({
    violate_id: violate_id,
    violate_lic_num: violate_lic,
    violate_loc: violate_loc,
    violate_reporter_wxid: wxid,
    violate_res: "",
    violate_judge: "",
  });
  await violate_img.create({
    violate_id: violate_id,
    violate_img_dir: "/tmp/my-uploads/" + violate_img_name,
  });
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

// 请求所有学院的违章次数信息
router.get("/NumOfAcademyEvents", async (req, res) => {
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
    attributes: ["violate_lic_num"],
    where: {
      violate_res: "Y",
    },
  });
  // 记录所有违章信息
  violate_infos = [];
  // 组成数组
  all_lic = [];
  for (i = 0; i < AcademyEvents.length; i++) {
    all_lic.push(AcademyEvents[i].violate_lic_num);
    violate_infos.push({ violate_lic: AcademyEvents[i].violate_lic_num });
  }
  // 查询所有违章者学号
  var Violate_user_id = await cycle_info.findAll({
    attributes: ["cycle_user_id", "cycle_lic_num"],
    where: {
      cycle_lic_num: all_lic,
    },
  });
  // 组成数组并补充所有违章信息
  all_id = [];
  for (i = 0; i < Violate_user_id.length; i++) {
    all_id.push(Violate_user_id[i].cycle_user_id);
    for (j in violate_infos) {
      if (violate_infos[j].violate_lic == Violate_user_id[i].cycle_lic_num) {
        violate_infos[j].violate_user_id = Violate_user_id[i].cycle_user_id;
      }
    }
  }
  // 查询所有违章者所属学院信息
  var Violate_academys = await user_info.findAll({
    attributes: ["user_academy", "user_id"],
    where: {
      user_id: all_id,
    },
  });
  // 补充所有违章信息
  for (i in Violate_academys) {
    for (j in violate_infos) {
      if (Violate_academys[i].user_id == violate_infos[j].violate_user_id) {
        violate_infos[j].violate_user_academy =
          Violate_academys[i].user_academy;
      }
    }
  }
  // 统计各学院违章次数
  academy_counts = [];
  for (let i in academys) {
    var academy_count = 0;
    for (let j in violate_infos) {
      if (violate_infos[j].violate_user_academy == academys[i]) {
        academy_count += 1;
      }
    }
    academy_counts.push(academy_count);
  }
  // 编辑返回报文
  academy_res = [];
  for (i = 0; i < academys.length; i++) {
    academy_res.push({
      academy_name: academys[i],
      academy_event_num: academy_counts[i],
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

//

//
module.exports = router;
