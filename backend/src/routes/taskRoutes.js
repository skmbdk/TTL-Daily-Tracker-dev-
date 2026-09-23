import express from 'express';
import {
  addComment,
  updateTaskComment,
  deleteTaskComment,
  addTaskRemark,
  createTask,
  deleteTask,
  getComments,
  getTaskById,
  getTaskRemarks,
  getTasks,
  updateTask,
  updateTaskPriority,
  updateTaskStatus,
  updateTaskRemark,
  deleteTaskRemark,
  getTaskAttachments,
  uploadTaskAttachment,
  addLinkAttachment,
  downloadTaskAttachment,
  deleteTaskAttachment
} from '../controllers/taskController.js';
import { protect } from '../middleware/authMiddleware.js';
import { blockReadOnlyMutations } from '../middleware/readOnlyMiddleware.js';
import { uploadAttachmentMiddleware } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.use(protect);
router.use(blockReadOnlyMutations);
router.route('/').get(getTasks).post(createTask);
router.get('/attachments/:attachmentId/download', downloadTaskAttachment);
router.delete('/attachments/:attachmentId', deleteTaskAttachment);
router.route('/:id').get(getTaskById).put(updateTask).delete(deleteTask);
router.patch('/:id/status', updateTaskStatus);
router.patch('/:id/priority', updateTaskPriority);
router.route('/:id/remarks').get(getTaskRemarks).post(addTaskRemark);
router.route('/:id/remarks/:remark_id').put(updateTaskRemark).delete(deleteTaskRemark);
router.route('/:id/comments').get(getComments).post(addComment);
router.route('/:id/comments/:comment_id').put(updateTaskComment).delete(deleteTaskComment);
router.post('/:id/attachments/link', addLinkAttachment);
router.route('/:id/attachments')
  .get(getTaskAttachments)
  .post(uploadAttachmentMiddleware.single('file'), uploadTaskAttachment);

export default router;
