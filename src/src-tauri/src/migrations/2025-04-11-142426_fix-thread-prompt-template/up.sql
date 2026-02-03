-- Your SQL goes here
ALTER TABLE `threads` DROP COLUMN `prompt_template`;
ALTER TABLE `threads` ADD COLUMN `prompt_template` TEXT;
