CREATE TABLE florists (
                          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                          name VARCHAR(150) NOT NULL,
                          slogan VARCHAR(255),
                          description TEXT,
                          logo_url TEXT,
                          whatsapp VARCHAR(20),
                          email VARCHAR(150),
                          address TEXT,
                          business_hours VARCHAR(100),
                          theme JSONB,              -- colores, tipografía, etc.
                          active BOOLEAN DEFAULT TRUE,
                          created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE admins (
                        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                        florist_id UUID REFERENCES florists(id),
                        email VARCHAR(150) UNIQUE NOT NULL,
                        password_hash TEXT NOT NULL,
                        active BOOLEAN DEFAULT TRUE,
                        created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE hero_slides (
                             id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                             florist_id UUID REFERENCES florists(id),
                             title VARCHAR(150),
                             subtitle VARCHAR(255),
                             image_url TEXT NOT NULL,
                             sort_order INT DEFAULT 1,
                             active BOOLEAN DEFAULT TRUE,
                             created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE about_section (
                               florist_id UUID PRIMARY KEY REFERENCES florists(id),
                               title VARCHAR(150),
                               content TEXT,
                               image_url TEXT,
                               years_experience INT,
                               products_count INT,
                               handmade_percentage INT
);

CREATE TABLE categories (
                            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                            florist_id UUID REFERENCES florists(id),
                            name VARCHAR(100) NOT NULL,
                            description TEXT,
                            sort_order INT DEFAULT 1,
                            active BOOLEAN DEFAULT TRUE
);

CREATE TABLE products (
                          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                          florist_id UUID REFERENCES florists(id),
                          category_id UUID REFERENCES categories(id),
                          name VARCHAR(150) NOT NULL,
                          description TEXT,
                          price NUMERIC(10,2) NOT NULL,
                          image_url TEXT,
                          featured BOOLEAN DEFAULT FALSE,
                          active BOOLEAN DEFAULT TRUE,
                          created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE orders (
                        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                        florist_id UUID REFERENCES florists(id),
                        customer_name VARCHAR(150),
                        customer_phone VARCHAR(20),
                        notes TEXT,
                        total_estimated NUMERIC(10,2),
                        status VARCHAR(30) DEFAULT 'CREATED',
                        created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE order_items (
                             id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                             order_id UUID REFERENCES orders(id),
                             product_id UUID REFERENCES products(id),
                             quantity INT DEFAULT 1,
                             price NUMERIC(10,2)
);

CREATE TABLE contact_methods (
                                 id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                                 florist_id UUID REFERENCES florists(id),
                                 type VARCHAR(50),       -- address, phone, email, hours
                                 value TEXT,
                                 icon VARCHAR(50),
                                 sort_order INT
);

CREATE TABLE payment_methods (
                                 id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                                 florist_id UUID REFERENCES florists(id),
                                 code VARCHAR(50),          -- CASH, TRANSFER, MOBILE_PAY
                                 name VARCHAR(100),         -- Efectivo, Transferencia, Pago Móvil
                                 description TEXT,
                                 icon VARCHAR(50),
                                 active BOOLEAN DEFAULT TRUE,
                                 sort_order INT
);

CREATE TABLE mobile_payment_providers (
                                          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                                          florist_id UUID REFERENCES florists(id),
                                          payment_method_id UUID REFERENCES payment_methods(id),
                                          name VARCHAR(100) NOT NULL,       -- Ahorita, MegoWallet, DeUna
                                          description TEXT,
                                          qr_image_url TEXT NOT NULL,
                                          active BOOLEAN DEFAULT TRUE,
                                          sort_order INT DEFAULT 1,
                                          created_at TIMESTAMP DEFAULT now()
);

