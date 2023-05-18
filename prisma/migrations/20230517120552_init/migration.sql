-- CreateTable
CREATE TABLE `movies` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `Title` VARCHAR(200) NOT NULL,
    `Description` VARCHAR(400) NOT NULL,
    `Runtime` INTEGER NOT NULL,
    `Genre` VARCHAR(200) NOT NULL,
    `Rating` FLOAT NOT NULL,
    `Metascore` VARCHAR(200) NOT NULL,
    `Votes` INTEGER NOT NULL,
    `Gross_Earning_in_Mil` VARCHAR(200) NOT NULL,
    `Director` VARCHAR(50) NOT NULL,
    `Actor` VARCHAR(50) NOT NULL,
    `Year` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `roles` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `role` VARCHAR(100) NULL,

    UNIQUE INDEX `role`(`role`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `users` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(50) NOT NULL,
    `username` VARCHAR(50) NULL,
    `password` VARCHAR(200) NOT NULL,
    `email` VARCHAR(200) NULL,
    `role_id` INTEGER NOT NULL,

    UNIQUE INDEX `username`(`username`),
    UNIQUE INDEX `email`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `users` ADD CONSTRAINT `users_role_id_fkey` FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
