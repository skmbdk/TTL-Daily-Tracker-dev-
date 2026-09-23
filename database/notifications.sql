IF OBJECT_ID(N'dbo.Notifications', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Notifications (
        notification_id INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_Notifications PRIMARY KEY,
        user_id INT NOT NULL,
        type NVARCHAR(50) NOT NULL,
        title NVARCHAR(200) NOT NULL,
        message NVARCHAR(1000) NULL,
        related_task_id INT NULL,
        is_read BIT NOT NULL CONSTRAINT DF_Notifications_is_read DEFAULT 0,
        created_at DATETIME2 NOT NULL CONSTRAINT DF_Notifications_created_at DEFAULT SYSUTCDATETIME(),
        CONSTRAINT FK_Notifications_Users FOREIGN KEY (user_id) REFERENCES dbo.Users(user_id),
        CONSTRAINT FK_Notifications_Tasks FOREIGN KEY (related_task_id) REFERENCES dbo.Tasks(task_id) ON DELETE SET NULL
    );
END;
GO

IF NOT EXISTS (
    SELECT 1
    FROM sys.indexes
    WHERE name = N'IX_Notifications_UserUnread'
      AND object_id = OBJECT_ID(N'dbo.Notifications')
)
BEGIN
    CREATE INDEX IX_Notifications_UserUnread
    ON dbo.Notifications(user_id, is_read, created_at DESC);
END;
GO

IF NOT EXISTS (
    SELECT 1
    FROM sys.indexes
    WHERE name = N'IX_Notifications_Task'
      AND object_id = OBJECT_ID(N'dbo.Notifications')
)
BEGIN
    CREATE INDEX IX_Notifications_Task
    ON dbo.Notifications(related_task_id);
END;
GO
