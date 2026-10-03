-- Make email column nullable to allow members without an SRMIST email
ALTER TABLE members ALTER COLUMN email DROP NOT NULL;
