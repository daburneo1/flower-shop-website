-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.about_paragraphs (
                                         id uuid NOT NULL DEFAULT gen_random_uuid(),
                                         florist_id uuid,
                                         content text NOT NULL,
                                         sort_order integer DEFAULT 1,
                                         created_at timestamp without time zone DEFAULT now(),
                                         CONSTRAINT about_paragraphs_pkey PRIMARY KEY (id),
                                         CONSTRAINT about_paragraphs_florist_id_fkey FOREIGN KEY (florist_id) REFERENCES public.florists(id)
);
CREATE TABLE public.about_section (
                                      florist_id uuid NOT NULL,
                                      title character varying,
                                      content text,
                                      image_url text,
                                      years_experience integer,
                                      products_count integer,
                                      handmade_percentage integer,
                                      CONSTRAINT about_section_pkey PRIMARY KEY (florist_id),
                                      CONSTRAINT about_section_florist_id_fkey FOREIGN KEY (florist_id) REFERENCES public.florists(id)
);
CREATE TABLE public.about_stats (
                                    id uuid NOT NULL DEFAULT gen_random_uuid(),
                                    florist_id uuid,
                                    label character varying NOT NULL,
                                    value character varying NOT NULL,
                                    sort_order integer DEFAULT 1,
                                    created_at timestamp without time zone DEFAULT now(),
                                    CONSTRAINT about_stats_pkey PRIMARY KEY (id),
                                    CONSTRAINT about_stats_florist_id_fkey FOREIGN KEY (florist_id) REFERENCES public.florists(id)
);
CREATE TABLE public.admins (
                               id uuid NOT NULL DEFAULT gen_random_uuid(),
                               florist_id uuid,
                               email character varying NOT NULL UNIQUE,
                               password_hash text NOT NULL,
                               active boolean DEFAULT true,
                               created_at timestamp without time zone DEFAULT now(),
                               CONSTRAINT admins_pkey PRIMARY KEY (id),
                               CONSTRAINT admins_florist_id_fkey FOREIGN KEY (florist_id) REFERENCES public.florists(id)
);
CREATE TABLE public.categories (
                                   id uuid NOT NULL DEFAULT gen_random_uuid(),
                                   florist_id uuid,
                                   name character varying NOT NULL,
                                   description text,
                                   sort_order integer DEFAULT 1,
                                   active boolean DEFAULT true,
                                   CONSTRAINT categories_pkey PRIMARY KEY (id),
                                   CONSTRAINT categories_florist_id_fkey FOREIGN KEY (florist_id) REFERENCES public.florists(id)
);
CREATE TABLE public.contact_methods (
                                        id uuid NOT NULL DEFAULT gen_random_uuid(),
                                        florist_id uuid,
                                        type character varying,
                                        value text,
                                        icon character varying,
                                        position integer,
                                        CONSTRAINT contact_methods_pkey PRIMARY KEY (id),
                                        CONSTRAINT contact_methods_florist_id_fkey FOREIGN KEY (florist_id) REFERENCES public.florists(id)
);
CREATE TABLE public.florists (
                                 id uuid NOT NULL DEFAULT gen_random_uuid(),
                                 name character varying NOT NULL,
                                 slogan character varying,
                                 description text,
                                 logo_url text,
                                 whatsapp character varying,
                                 email character varying,
                                 address text,
                                 business_hours character varying,
                                 theme jsonb,
                                 active boolean DEFAULT true,
                                 created_at timestamp without time zone DEFAULT now(),
                                 latitude numeric,
                                 longitude numeric,
                                 CONSTRAINT florists_pkey PRIMARY KEY (id)
);
CREATE TABLE public.mobile_payment_providers (
                                                 id uuid NOT NULL DEFAULT gen_random_uuid(),
                                                 florist_id uuid,
                                                 payment_method_id uuid,
                                                 name character varying NOT NULL,
                                                 description text,
                                                 qr_image_url text NOT NULL,
                                                 active boolean DEFAULT true,
                                                 sort_order integer DEFAULT 1,
                                                 created_at timestamp without time zone DEFAULT now(),
                                                 CONSTRAINT mobile_payment_providers_pkey PRIMARY KEY (id),
                                                 CONSTRAINT mobile_payment_providers_florist_id_fkey FOREIGN KEY (florist_id) REFERENCES public.florists(id),
                                                 CONSTRAINT mobile_payment_providers_payment_method_id_fkey FOREIGN KEY (payment_method_id) REFERENCES public.payment_methods(id)
);
CREATE TABLE public.order_items (
                                    id uuid NOT NULL DEFAULT gen_random_uuid(),
                                    order_id uuid,
                                    product_id uuid,
                                    quantity integer DEFAULT 1,
                                    price numeric,
                                    CONSTRAINT order_items_pkey PRIMARY KEY (id),
                                    CONSTRAINT order_items_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id),
                                    CONSTRAINT order_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id)
);
CREATE TABLE public.orders (
                               id uuid NOT NULL DEFAULT gen_random_uuid(),
                               florist_id uuid,
                               customer_name character varying,
                               customer_phone character varying,
                               notes text,
                               total_estimated numeric,
                               status character varying DEFAULT 'CREATED'::character varying,
                               created_at timestamp without time zone DEFAULT now(),
                               CONSTRAINT orders_pkey PRIMARY KEY (id),
                               CONSTRAINT orders_florist_id_fkey FOREIGN KEY (florist_id) REFERENCES public.florists(id)
);
CREATE TABLE public.payment_methods (
                                        id uuid NOT NULL DEFAULT gen_random_uuid(),
                                        florist_id uuid,
                                        code character varying,
                                        name character varying,
                                        description text,
                                        icon character varying,
                                        active boolean DEFAULT true,
                                        sort_order integer,
                                        CONSTRAINT payment_methods_pkey PRIMARY KEY (id),
                                        CONSTRAINT payment_methods_florist_id_fkey FOREIGN KEY (florist_id) REFERENCES public.florists(id)
);
CREATE TABLE public.products (
                                 id uuid NOT NULL DEFAULT gen_random_uuid(),
                                 florist_id uuid,
                                 category_id uuid,
                                 name character varying NOT NULL,
                                 description text,
                                 price numeric NOT NULL,
                                 image_url text,
                                 featured boolean DEFAULT false,
                                 active boolean DEFAULT true,
                                 created_at timestamp without time zone DEFAULT now(),
                                 CONSTRAINT products_pkey PRIMARY KEY (id),
                                 CONSTRAINT products_florist_id_fkey FOREIGN KEY (florist_id) REFERENCES public.florists(id),
                                 CONSTRAINT products_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id)
);
CREATE TABLE public.social_links (
                                     id uuid NOT NULL DEFAULT gen_random_uuid(),
                                     florist_id uuid,
                                     platform character varying,
                                     url text,
                                     icon character varying,
                                     display_order integer DEFAULT 1,
                                     is_active boolean DEFAULT true,
                                     created_at timestamp without time zone DEFAULT now(),
                                     CONSTRAINT social_links_pkey PRIMARY KEY (id),
                                     CONSTRAINT social_links_florist_id_fkey FOREIGN KEY (florist_id) REFERENCES public.florists(id)
);