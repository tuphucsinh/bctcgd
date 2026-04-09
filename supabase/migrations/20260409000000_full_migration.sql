ALTER TYPE transaction_type ADD VALUE IF NOT EXISTS 'ADJUSTMENT';

UPDATE transactions SET owner = 'HIEU' WHERE owner = 'JOINT';

ALTER TABLE debts DROP COLUMN IF EXISTS owner;
ALTER TABLE assets DROP COLUMN IF EXISTS owner;

CREATE TYPE owner_type_new AS ENUM ('HIEU', 'LY');

ALTER TABLE transactions ALTER COLUMN owner DROP DEFAULT;

ALTER TABLE transactions 
  ALTER COLUMN owner TYPE owner_type_new 
  USING owner::text::owner_type_new;

DROP TYPE owner_type;
ALTER TYPE owner_type_new RENAME TO owner_type;
