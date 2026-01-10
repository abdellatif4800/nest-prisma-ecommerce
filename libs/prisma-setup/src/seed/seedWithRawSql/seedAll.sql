CREATE EXTENSION IF NOT EXISTS pgcrypto;

\echo '=== INSERTING USERS ===';
INSERT INTO "public"."User" (
    "id", 
    "username", 
    "email", 
    "password", 
    "isBlocked", 
    "role", 
    "joinedAt"
) 
VALUES 
(
    'user-id-101',                     
    'manual_user',                         
    'manual@example.com',                   
    crypt('qweasdzxc123', gen_salt('bf',10)),
    false,                                  
    'user',                                 
    NOW()                                  
),
(
    'admin-id-101',                     
    'manual_user',                         
    'manualAdmin@example.com',                   
    crypt('qweasdzxc123', gen_salt('bf',10)),
    false,                                  
    'admin',                                 
    NOW()                                  
);
\echo '======================'



\echo '=== INSERTING CART ===';
INSERT INTO "Cart" ("id", "userId", "createdAt", "updatedAt")
VALUES (
    'cart-id-101',
    'user-id-101',
    NOW(),
    NOW()
);
\echo '======================'


BEGIN;
\echo '=== 1. INSERTING Categories ===';
INSERT INTO "Categories" (id, category, created_at)
VALUES 
  ('cat1', 'Electronics', NOW()),
  ('cat2', 'Clothing', NOW());
\echo '=======================================================';

\echo '=== 2. INSERTING SubCategories ===';
INSERT INTO "SubCategories" (id, "subCategory", created_at, "categoryId")
VALUES 
  ('sub1', 'Smartphones', NOW(), 'cat1'),
  ('sub2', 'Laptops', NOW(), 'cat1'),
  ('sub3', 'Men Clothing', NOW(), 'cat2');



\echo '=== 3. INSERTING Products (Without Default Variant) ===';
INSERT INTO "Product" (
    "id", 
    "productName", 
    "price", 
    "discount", 
    "rate", 
    -- "imageUrl" removed from here (belongs to Variant now)
    "publish", 
    "subCategoryId", 
    "updatedAt"
) 
VALUES 
(
    'prod-001',                   -- id
    'Mechanical Keyboard',        -- productName
    120.00,                       -- price
    0.0,                          -- discount
    5.0,                          -- rate
    true,                         -- publish
    'sub1',                       -- subCategoryId
    NOW()                         -- updatedAt
),
(
    'prod-002', 
    'Gaming Mouse',               -- Changed name for clarity
    50.00, 
    0.0, 
    4.5, 
    true, 
    'sub2', 
    NOW()
);
\echo '=======================================================';


\echo '=== 4. INSERTING Product Variants (With Images) ===';
INSERT INTO "ProductVariant" (
    "id", 
    "color", 
    "size", 
    "stock", 
    "price", 
    "imageUrl",       -- Moved Image Here
    "productId"
) 
VALUES 
(
    'variant-001',    -- id
    'Black',          -- color
    'TKL',            -- size
    50,               -- stock
    120.00,           -- price
    'https://placehold.co/600', -- imageUrl
    'prod-001'        -- Link to Product 1
),
(
    'variant-002', 
    'White', 
    'Standard', 
    40, 
    50.00, 
    'https://placehold.co/600', 
    'prod-002'        -- Link to Product 2
);
\echo '=======================================================';


\echo '=== 5. UPDATING Products (Setting Defaults) ===';
-- Now that variants exist, we update the products to point to them
UPDATE "Product"
SET "defaultVariantId" = 'variant-001'
WHERE "id" = 'prod-001';

UPDATE "Product"
SET "defaultVariantId" = 'variant-002'
WHERE "id" = 'prod-002';

\echo '=== DONE ===';

-- Commit the transaction
COMMIT;
\echo '=======================================================';


\echo '=== 6. Insert Orders ===';
INSERT INTO "Orders" (
    "id", 
    "userId", 
    "total", 
    "status", 
    "address", 
    "paymentMethod", 
    "updatedAt"
) 
VALUES (
    'order_01',            -- id (Text/UUID)
    'user-id-101',                     
    2000.00,               -- total
    'pending',             -- status
    '123 Nile St, Cairo',  -- address
    'COD',                -- paymentMethod
    NOW()                  -- updatedAt (Required since no default is shown)
),
(
    'order_02',            -- id (Text/UUID)
    'user-id-101',                     
    1500.00,               -- total
    'prepairing',             -- status
    '123 Nile St, Cairo',  -- address
    'Card',                -- paymentMethod
    NOW()                  -- updatedAt (Required since no default is shown)
);

\echo '=======================================================';


\echo '=== 7. Insert order items ===';
INSERT INTO "OrderItems" (
    "id", 
    "orderId", 
    "quantity", 
    "variantId", 
    "snapshotPrice"
) 
VALUES 
-- Item 1
(
    'item_01',      -- id
    'order_01',     -- orderId (MUST match the Order created above)
    2,              -- quantity
    'variant-001',    -- variantId
    500.00          -- snapshotPrice
),
-- Item 2
(
    'item_02',      -- id
    'order_02',     -- orderId
    1,              -- quantity
    'variant-002',    -- variantId
    500.00          -- snapshotPrice
);

