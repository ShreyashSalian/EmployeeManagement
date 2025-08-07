import { CONSTANT_LIST } from "../constants/global-constants";
import { DepartmentBody } from "../helpers/department.helper";
import { Department } from "../models/department.model";
import {
  asycHandler,
  SearchBody,
  sendError,
  sendSuccess,
} from "../utils/function";
import express from "express";

export const addNewDepartment = asycHandler(
  async (
    req: express.Request<{}, {}, DepartmentBody>,
    res: express.Response
  ): Promise<express.Response> => {
    try {
      const { name, description, manager } = req.body;
      const nameAlreadyExist = await Department.findOne({
        name: name,
      });
      if (nameAlreadyExist) {
        return sendError(
          res,
          CONSTANT_LIST.STATUS_ERROR,
          CONSTANT_LIST.VALIDATION_ERROR,
          "The name already exist"
        );
      }

      const departmentCreation = await Department.create({
        name,
        description,
        manager,
      });

      if (departmentCreation) {
        return sendSuccess(
          res,
          CONSTANT_LIST.STATUS_SUCCESS,
          CONSTANT_LIST.STATUS_CODE_OK,
          "The department has been added successfully.",
          departmentCreation
        );
      } else {
        return sendError(
          res,
          CONSTANT_LIST.STATUS_ERROR,
          CONSTANT_LIST.BAD_REQUEST,
          "Sorry, the department can not be added."
        );
      }
    } catch (err: any) {
      console.log(err);
      return sendError(
        res,
        CONSTANT_LIST.STATUS_ERROR,
        CONSTANT_LIST.INTERNAL_SERVER_ERROR,
        CONSTANT_LIST.INTERNAL_SERVER_ERROR_MESSAGE
      );
    }
  }
);

export const updateDepartment = asycHandler(
  async (
    req: express.Request<{ departmentId: string }, {}, DepartmentBody>,
    res: express.Response
  ): Promise<express.Response> => {
    try {
      const departmentId = req.params.departmentId;
      const { name, description, manager } = req.body;
      const updateDepartment = await Department.findByIdAndUpdate(
        departmentId,
        {
          $set: {
            name,
            description,
            manager,
          },
        }
      );
      if (updateDepartment) {
        return sendSuccess(
          res,
          CONSTANT_LIST.STATUS_SUCCESS,
          CONSTANT_LIST.STATUS_CODE_OK,
          "The department has been updated.",
          updateDepartment
        );
      } else {
        return sendError(
          res,
          CONSTANT_LIST.STATUS_ERROR,
          CONSTANT_LIST.BAD_REQUEST,
          "Sorry, the department can not be updated."
        );
      }
    } catch (err: any) {
      console.log(err);
      return sendError(
        res,
        CONSTANT_LIST.STATUS_ERROR,
        CONSTANT_LIST.INTERNAL_SERVER_ERROR,
        CONSTANT_LIST.INTERNAL_SERVER_ERROR_MESSAGE
      );
    }
  }
);

export const softDeleteDepartment = asycHandler(
  async (
    req: express.Request<{ departmentId: string }, {}>,
    res: express.Response
  ): Promise<express.Response> => {
    try {
      const departmentId = req.params.departmentId;
      if (!departmentId) {
        return sendError(
          res,
          CONSTANT_LIST.STATUS_ERROR,
          CONSTANT_LIST.BAD_REQUEST,
          "Please select the department."
        );
      }
      const updateTheDeleteStatus = await Department.findByIdAndUpdate(
        departmentId,
        {
          $set: {
            isDeleted: true,
          },
        },
        {
          new: true,
        }
      );
      if (updateTheDeleteStatus) {
        return sendSuccess(
          res,
          CONSTANT_LIST.STATUS_SUCCESS,
          CONSTANT_LIST.STATUS_CODE_OK,
          "The department has been deleted.",
          null
        );
      } else {
        return sendError(
          res,
          CONSTANT_LIST.STATUS_ERROR,
          CONSTANT_LIST.BAD_REQUEST,
          "Sorry, the department cant be deleted."
        );
      }
    } catch (err: any) {
      console.log(err);
      return sendError(
        res,
        CONSTANT_LIST.STATUS_ERROR,
        CONSTANT_LIST.INTERNAL_SERVER_ERROR,
        CONSTANT_LIST.INTERNAL_SERVER_ERROR_MESSAGE
      );
    }
  }
);

export const deleteDepartment = asycHandler(
  async (
    req: express.Request<{ departmentId: string }, {}, {}>,
    res: express.Response
  ): Promise<express.Response> => {
    try {
      const departmentId = req.params.departmentId;
      if (!departmentId) {
        return sendError(
          res,
          CONSTANT_LIST.STATUS_ERROR,
          CONSTANT_LIST.BAD_REQUEST,
          "Please select the department."
        );
      }
      const deleteDepartment = await Department.findByIdAndDelete(departmentId);
      if (deleteDepartment) {
        return sendSuccess(
          res,
          CONSTANT_LIST.STATUS_SUCCESS,
          CONSTANT_LIST.STATUS_CODE_OK,
          "The department has been deleted.",
          null
        );
      } else {
        return sendError(
          res,
          CONSTANT_LIST.STATUS_ERROR,
          CONSTANT_LIST.BAD_REQUEST,
          "Sorry, the department can not be deleted."
        );
      }
    } catch (err: any) {
      console.log(err);
      return sendError(
        res,
        CONSTANT_LIST.STATUS_ERROR,
        CONSTANT_LIST.INTERNAL_SERVER_ERROR,
        CONSTANT_LIST.AUTHORIZATION_ERROR_MESSAGE
      );
    }
  }
);

export const listAllDepartment = asycHandler(
  async (
    req: express.Request<{}, {}, SearchBody>,
    res: express.Response
  ): Promise<express.Response> => {
    try {
      const user = req.user?.userId;
      const page = req.body.page || 1;
      const limit = req.body.limit || 10;
      const skip = (page - 1) * limit;
      const sortBy = req.body.sortBy || "createdAt";
      const sortOrder = req.body.sortOrder === "asc" ? 1 : -1;
      const search = req.body.search;

      const searchFilter = search
        ? {
            $or: [
              {
                name: { $regex: search, $options: "i" },
              },
              {
                description: { $regex: search, $options: "i" },
              },
            ],
          }
        : {};
      const matchStage = {
        $and: [{ isDeleted: false }, ...(search ? [searchFilter] : [])],
      };

      const [departmentDetail, totalDepartment] = await Promise.all([
        Department.aggregate([
          { $match: matchStage },
          { $sort: { [sortBy]: sortOrder } },
          { $skip: skip },
          { $limit: limit },
        ]),
        Department.countDocuments(matchStage),
      ]);
      if (departmentDetail) {
        return sendError(
          res,
          CONSTANT_LIST.STATUS_ERROR,
          CONSTANT_LIST.BAD_REQUEST,
          "There is no department."
        );
      }

      const responsePayload = {
        data: departmentDetail,
        pagination: {
          total: totalDepartment,
          page,
          limit,
          totalPage: Math.ceil(totalDepartment / limit),
        },
      };
      return sendSuccess(
        res,
        CONSTANT_LIST.STATUS_SUCCESS,
        CONSTANT_LIST.STATUS_CODE_OK,
        "The department list",
        responsePayload
      );
    } catch (err: any) {
      console.log(err);
      return sendError(
        res,
        CONSTANT_LIST.STATUS_ERROR,
        CONSTANT_LIST.INTERNAL_SERVER_ERROR,
        CONSTANT_LIST.INTERNAL_SERVER_ERROR_MESSAGE
      );
    }
  }
);
