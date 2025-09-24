import express from "express";
import {
  asycHandler,
  generateProjectCode,
  sendError,
  sendSuccess,
} from "../utils/function";
import { Project } from "../models/project.model";
import { CONSTANT_LIST } from "../constants/global-constants";
import { ProjectBody } from "../helpers/project.helper";

export const addNewProject = asycHandler(
  async (
    req: express.Request<{}, {}, ProjectBody>,
    res: express.Response
  ): Promise<express.Response> => {
    try {
      const {
        title,
        description,
        startDate,
        endDate,
        status,
        teamMember,
        department,
      } = req.body;

      const projectCode = await generateProjectCode();
      const projectCreation = await Project.create({
        title,
        description,
        startDate,
        projectCode,
        endDate,
        status,
        teamMember,
        department,
      });

      if (projectCreation) {
        return sendSuccess(
          res,
          CONSTANT_LIST.STATUS_SUCCESS,
          CONSTANT_LIST.STATUS_CODE_OK,
          "Project has been created.",
          projectCreation
        );
      } else {
        return sendError(
          res,
          CONSTANT_LIST.STATUS_ERROR,
          CONSTANT_LIST.BAD_REQUEST,
          "Sorry, the project can not be added."
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

export const updateProject = asycHandler(
  async (
    req: express.Request<{ projectId: string }, {}, ProjectBody>,
    res: express.Response
  ): Promise<express.Response> => {
    try {
      const projectId = req.params.projectId;
      const {
        title,
        description,
        startDate,
        endDate,
        status,
        teamMember,
        department,
      } = req.body;
      const updateProject = await Project.findByIdAndUpdate(
        projectId,
        {
          $set: {
            title,
            description,
            startDate,
            endDate,
            status,
            teamMember,
            department,
          },
        },
        {
          new: true,
        }
      );
      if (updateProject) {
        return sendSuccess(
          res,
          CONSTANT_LIST.STATUS_SUCCESS,
          CONSTANT_LIST.STATUS_CODE_OK,
          "The project has been updated.",
          updateProject
        );
      } else {
        return sendError(
          res,
          CONSTANT_LIST.STATUS_ERROR,
          CONSTANT_LIST.BAD_REQUEST,
          "The project can not be updated"
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

export const softDeleteProject = asycHandler(
  async (
    req: express.Request<{ projectId: string }, {}, {}>,
    res: express.Response
  ): Promise<express.Response> => {
    try {
      const projectId = req.params.projectId;
      const updateProjectStatus = await Project.findByIdAndUpdate(projectId, {
        $set: {
          isDeleted: false,
        },
      });
      if (updateProjectStatus) {
        return sendSuccess(
          res,
          CONSTANT_LIST.STATUS_SUCCESS,
          CONSTANT_LIST.STATUS_CODE_OK,
          "The project has been deleted.",
          null
        );
      } else {
        return sendError(
          res,
          CONSTANT_LIST.STATUS_ERROR,
          CONSTANT_LIST.BAD_REQUEST,
          "Sorry, the project can not be deleted."
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

export const deleteProject = asycHandler(
  async (
    req: express.Request<{ projectId: string }, {}, {}>,
    res: express.Response
  ): Promise<express.Response> => {
    try {
      const projectId = req.params.projectId;
      const deleteProjectDetail = await Project.findByIdAndDelete(projectId);
      if (deleteProjectDetail) {
        return sendSuccess(
          res,
          CONSTANT_LIST.STATUS_SUCCESS,
          CONSTANT_LIST.STATUS_CODE_OK,
          "The project has been deleted.",
          null
        );
      } else {
        return sendError(
          res,
          CONSTANT_LIST.STATUS_ERROR,
          CONSTANT_LIST.BAD_REQUEST,
          "Sorry, the project can not be deleted."
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

export const listAllProject = asycHandler(
  async (
    req: express.Request,
    res: express.Response
  ): Promise<express.Response> => {
    try {
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
              {
                projectCode: { $regex: search, $options: "i" },
              },
            ],
          }
        : {};
      const matchStage = {
        ...searchFilter,
        isDeleted: false,
      };
      const [projectDetail, totalProject] = await Promise.all([
        Project.aggregate([
          {
            $match: matchStage,
          },
          {
            $lookup: {
              from: "users",
              localField: "teamMember",
              foreignField: "_id",
              as: "teamMemberDetail",
              pipeline: [
                {
                  $project: {
                    userName: 1,
                    firstName: 1,
                    lastName: 1,
                    email: 1,
                  },
                },
              ],
            },
          },
          {
            $lookup: {
              from: "departments",
              localField: "department",
              foreignField: "_id",
              as: "departmentDetails",
            },
          },
          {
            $addFields: {
              departmentDetails: {
                $first: "$departmentDetails",
              },
            },
          },

          {
            $sort: {
              [sortBy]: sortOrder,
            },
          },
          {
            $skip: skip,
          },
          {
            $limit: limit,
          },
        ]),
        Project.countDocuments(matchStage),
      ]);
      if (projectDetail.length === 0) {
        return sendError(
          res,
          CONSTANT_LIST.STATUS_ERROR,
          CONSTANT_LIST.NO_USER_FOUND,
          "Sorry, no project found"
        );
      } else {
        const responsePayload = {
          data: projectDetail,
          pagination: {
            page,
            limit,
            total: totalProject,
            totalPage: Math.ceil(totalProject / limit),
          },
        };
        return sendSuccess(
          res,
          CONSTANT_LIST.STATUS_SUCCESS,
          CONSTANT_LIST.STATUS_CODE_OK,
          "The project detail",
          responsePayload
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

export const getProjectById = asycHandler(
  async (
    req: express.Request<{ projectId: string }, {}, {}>,
    res: express.Response
  ): Promise<express.Response> => {
    try {
      const projectId = req.params.projectId;
      const projectDetail = await Project.aggregate([
        {
          $lookup: {
            from: "users",
            localField: "teamMember",
            foreignField: "_id",
            as: "teamMemberDetail",
            pipeline: [
              {
                $project: {
                  userName: 1,
                  firstName: 1,
                  lastName: 1,
                  email: 1,
                },
              },
            ],
          },
        },
        {
          $lookup: {
            from: "departments",
            localField: "department",
            foreignField: "_id",
            as: "departmentDetails",
          },
        },
        {
          $addFields: {
            departmentDetails: {
              $first: "$departmentDetails",
            },
          },
        },
      ]);
      if (projectDetail) {
        return sendSuccess(
          res,
          CONSTANT_LIST.STATUS_SUCCESS,
          CONSTANT_LIST.STATUS_CODE_OK,
          "The project detail",
          projectDetail
        );
      } else {
        return sendError(
          res,
          CONSTANT_LIST.STATUS_ERROR,
          CONSTANT_LIST.NO_USER_FOUND,
          "Sorry, no project created."
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

export const updateTeamMembers = asycHandler(
  async (
    req: express.Request<
      { projectId: string },
      {},
      { memberId: string; action: string }
    >,
    res: express.Response
  ): Promise<express.Response> => {
    try {
      const projectId = req.params.projectId;
      const { memberId, action } = req.body;
      if (!["add", "remove"].includes(action)) {
        return sendError(
          res,
          CONSTANT_LIST.STATUS_ERROR,
          CONSTANT_LIST.BAD_REQUEST,
          "Invalid action, user 'add' or remove."
        );
      }
      const updateQuery =
        action === "add"
          ? { $addToSet: { teamMember: memberId } }
          : { $pull: { teamMember: memberId } };
      const updateProject = await Project.findByIdAndUpdate(
        projectId,
        updateQuery,
        {
          new: true,
        }
      );
      if (updateProject) {
        return sendSuccess(
          res,
          CONSTANT_LIST.STATUS_SUCCESS,
          CONSTANT_LIST.STATUS_CODE_OK,
          "The team members have been updated",
          updateQuery
        );
      } else {
        return sendError(
          res,
          CONSTANT_LIST.STATUS_ERROR,
          CONSTANT_LIST.BAD_REQUEST,
          "Sorry, the project members can not be updated."
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
