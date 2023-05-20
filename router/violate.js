// 建立路由
const express = require("express");
const router = express.Router();

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

// 更新违章信息 //还没测试
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
