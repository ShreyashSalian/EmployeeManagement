import express from "express";
import { asycHandler, sendError, sendSuccess } from "../utils/function";
import { CONSTANT_LIST } from "../constants/global-constants";
import { PerformanceBody } from "../helpers/performance.helper";
import { PerformaceModel } from "../models/performance.model";
import { User } from "../models/user.model";
import { UserDetail } from "../models/userDetail.model";

export const addPerformace = asycHandler(
  async (
    req: express.Request<{}, {}, PerformanceBody>,
    res: express.Response
  ): Promise<express.Response> => {
    try {
      const {
        employee,
        projectId,
        reviewDate,
        rating,
        comments,
        goalsAchieved,
        goalsPending,
      } = req.body;

      const reviewer = req.user?.userId;
      const performanceAlreadyExist = await PerformaceModel.findOne({
        employee,
        projectId,
      });
      if (performanceAlreadyExist) {
        return sendError(
          res,
          CONSTANT_LIST.STATUS_ERROR,
          CONSTANT_LIST.BAD_REQUEST,
          "The rating already been added to the user for particular project.h"
        );
      }
      const performanceCreation = await PerformaceModel.create({
        employee,
        projectId,
        reviewDate,
        rating,
        comments,
        reviewer,
        goalsAchieved,
        goalsPending,
      });

      const existingRating = await PerformaceModel.find({ employee: employee });
      const totalRating = existingRating.length;
      const averageRating = existingRating.reduce(
        (sum, rate) => sum + rate.rating / totalRating,
        0
      );
      await UserDetail.findOneAndUpdate(
        { userId: employee },
        { averageRating, totalRating },
        { new: true }
      );
      if (performanceCreation) {
        return sendSuccess(
          res,
          CONSTANT_LIST.STATUS_SUCCESS,
          CONSTANT_LIST.STATUS_CODE_OK,
          "The performance has been added.",
          performanceCreation
        );
      } else {
        return sendError(
          res,
          CONSTANT_LIST.STATUS_ERROR,
          CONSTANT_LIST.BAD_REQUEST,
          "Sorry, the perofrmance can not be added."
        );
      }
    } catch (err: any) {
      return sendError(
        res,
        CONSTANT_LIST.STATUS_ERROR,
        CONSTANT_LIST.INTERNAL_SERVER_ERROR,
        CONSTANT_LIST.INTERNAL_SERVER_ERROR_MESSAGE
      );
    }
  }
);

export const updatePerformance = asycHandler(
  async (
    req: express.Request<{ performanceId: string }, {}, PerformanceBody>,
    res: express.Response
  ): Promise<express.Response> => {
    try {
      const performanceId = req.params.performanceId;

      const {
        employee,
        projectId,
        reviewDate,
        rating,
        comments,
        goalsAchieved,
        goalsPending,
      } = req.body;

      const reviewer = req.user?.userId;

      const performanceUpdate = await PerformaceModel.findByIdAndUpdate(
        { _id: performanceId },
        {
          $set: {
            employee,
            projectId,
            reviewDate,
            rating,
            comments,
            reviewer,
            goalsAchieved,
            goalsPending,
          },
        }
      );

      const existingRating = await PerformaceModel.find({ employee: employee });
      const totalRating = existingRating.length;
      const averageRating = existingRating.reduce(
        (sum, rate) => sum + rate.rating / totalRating,
        0
      );
      await UserDetail.findOneAndUpdate(
        { userId: employee },
        { averageRating, totalRating },
        { new: true }
      );
      if (performanceUpdate) {
        return sendSuccess(
          res,
          CONSTANT_LIST.STATUS_SUCCESS,
          CONSTANT_LIST.STATUS_CODE_OK,
          "The performance has been updated.",
          performanceUpdate
        );
      } else {
        return sendError(
          res,
          CONSTANT_LIST.STATUS_ERROR,
          CONSTANT_LIST.BAD_REQUEST,
          "Sorry, the perofrmance can not be added."
        );
      }
    } catch (err: any) {
      return sendError(
        res,
        CONSTANT_LIST.STATUS_ERROR,
        CONSTANT_LIST.INTERNAL_SERVER_ERROR,
        CONSTANT_LIST.INTERNAL_SERVER_ERROR_MESSAGE
      );
    }
  }
);
