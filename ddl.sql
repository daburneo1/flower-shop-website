CREATE TABLE florists (
                          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                          name VARCHAR(150) NOT NULL,
                          slogan VARCHAR(255),
                          description TEXT,
                          logo_url TEXT,
                          whatsapp VARCHAR(20),
                          email VARCHAR(150),
                          address TEXT,
                          latitude NUMERIC(9,6),
                          longitude NUMERIC(9,6),
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

ALTER TABLE florists
  ADD COLUMN IF NOT EXISTS latitude NUMERIC(9,6),
  ADD COLUMN IF NOT EXISTS longitude NUMERIC(9,6);

-- =====================================================
-- RPC: florist profile and map coordinates
-- =====================================================

CREATE OR REPLACE FUNCTION sp_get_florist(p_florist_id UUID)
RETURNS TABLE (
  id UUID,
  name VARCHAR,
  slogan VARCHAR,
  description TEXT,
  logo_url TEXT,
  whatsapp VARCHAR,
  email VARCHAR,
  address TEXT,
  latitude NUMERIC,
  longitude NUMERIC,
  business_hours VARCHAR,
  theme JSONB,
  active BOOLEAN,
  created_at TIMESTAMP
)
LANGUAGE sql
STABLE
AS $$
  SELECT
    f.id,
    f.name,
    f.slogan,
    f.description,
    f.logo_url,
    f.whatsapp,
    f.email,
    f.address,
    f.latitude,
    f.longitude,
    f.business_hours,
    f.theme,
    f.active,
    f.created_at
  FROM florists f
  WHERE f.id = p_florist_id
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION sp_upsert_florist_location(
  p_florist_id UUID,
  p_latitude NUMERIC DEFAULT NULL,
  p_longitude NUMERIC DEFAULT NULL
)
RETURNS TABLE(success BOOLEAN, message TEXT)
LANGUAGE plpgsql
AS $$
BEGIN
  IF p_latitude IS NOT NULL AND (p_latitude < -90 OR p_latitude > 90) THEN
    RETURN QUERY SELECT FALSE, 'Latitude must be between -90 and 90';
    RETURN;
  END IF;

  IF p_longitude IS NOT NULL AND (p_longitude < -180 OR p_longitude > 180) THEN
    RETURN QUERY SELECT FALSE, 'Longitude must be between -180 and 180';
    RETURN;
  END IF;

  UPDATE florists
  SET
    latitude = p_latitude,
    longitude = p_longitude
  WHERE id = p_florist_id;

  IF NOT FOUND THEN
    RETURN QUERY SELECT FALSE, 'Florist not found';
    RETURN;
  END IF;

  RETURN QUERY SELECT TRUE, 'Location updated';
END;
$$;

