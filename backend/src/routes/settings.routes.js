import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import {
    getSettings,
    updateProfile,
    getNotificationSettings,
    updateNotificationSettings,
    getAppearanceSettings,
    updateAppearanceSettings,
    getSecuritySettings,
    updateTwoFactor,
    endSession,
    getBackupSettings,
    updateBackupPreferences,
    createBackup,
    restoreBackup,
    downloadBackup,
    getSystemStatus,
    clearCache,
    optimizeDatabase,
    exportLogs
} from "../controllers/settings.controller.js";

const router = express.Router();

router.use(protect);

router.get('/', getSettings);

router.put('/profile', updateProfile);

router.get('/notifications', getNotificationSettings);
router.put('/notifications', updateNotificationSettings);

router.get('/appearance', getAppearanceSettings);
router.put('/appearance', updateAppearanceSettings);

router.get('/security', getSecuritySettings);
router.post('/security/two-factor', updateTwoFactor);
router.delete('/security/sessions/:sessionId', endSession);

router.get('/backups', getBackupSettings);
router.put('/backups/preferences', updateBackupPreferences);
router.post('/backups', createBackup);
router.post('/backups/:backupId/restore', restoreBackup);
router.get('/backups/:backupId/download', downloadBackup);

router.get('/system', getSystemStatus);
router.post('/system/clear-cache', clearCache);
router.post('/system/optimize-database', optimizeDatabase);
router.post('/system/export-logs', exportLogs);

export default router;
