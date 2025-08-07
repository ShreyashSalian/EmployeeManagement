import express from "express";
import { asycHandler, sendError, sendSuccess } from "../utils/function";
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

      const projectCreation = await Project.create({
        title,
        description,
        startDate,
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
