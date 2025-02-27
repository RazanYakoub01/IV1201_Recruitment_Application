--
-- Add a new column "status" to the person table, with a default value of 'unsent'
-- 

ALTER TABLE public.person ADD COLUMN status TEXT DEFAULT 'unsent';

--
-- Add a new column "last_updated" to the person table, with a default value of current time
-- 
ALTER TABLE public.person ADD COLUMN last_updated TIMESTAMP DEFAULT now();

--
-- Update the status to 'unhandled' for all applicants (role_id = 2) who have either a competence profile or availability (or both)
--

UPDATE public.person
    SET status = 'unhandled' WHERE role_id = 2  
    AND person_id IN ( 
        SELECT DISTINCT person_id FROM public.competence_profile 
        UNION 
        SELECT DISTINCT person_id FROM public.availability
    );

--
-- Set the status to NULL for people with role_id = 1
--

UPDATE public.person SET status = NULL WHERE role_id = 1;

--
-- Update the status for applicants (role_id = 2):
-- 'Missing Availability' if they have competence but no availability,
-- 'Missing Competence' if they have availability but no competence,
-- Leave status unchanged if both or neither exist
--

UPDATE public.person
SET status = CASE
        WHEN person_id IN (SELECT person_id FROM public.competence_profile)
             AND person_id NOT IN (SELECT person_id FROM public.availability) THEN 'Missing Availability'
        WHEN person_id IN (SELECT person_id FROM public.availability)
             AND person_id NOT IN (SELECT person_id FROM public.competence_profile) THEN 'Missing Competence'
        ELSE status  -- Keep the current status if both entries exist or neither is missing
    END
WHERE role_id = 2
AND (
    (person_id IN (SELECT person_id FROM public.competence_profile)
     AND person_id NOT IN (SELECT person_id FROM public.availability))
    OR
    (person_id IN (SELECT person_id FROM public.availability)
     AND person_id NOT IN (SELECT person_id FROM public.competence_profile))
);

--
-- Creating or replacing the 'application_view' view to gather relevant application data
-- This view retrieves details of applicants, their competences, and availability
-- It includes:
-- - Full name, email, and application status of the applicant
-- - Competences with years of experience
-- - Availability range (from and to dates)
--

CREATE OR REPLACE VIEW application_view AS
SELECT
    p.person_id AS application_id,
    p.name,
    p.surname,
    p.email,
    p.status AS application_status,
    p.last_updated, 
    COALESCE(STRING_AGG(comp.name || ' (' || c.years_of_experience || ' years)', ', '), 'No Competence') AS competences,
    COALESCE(STRING_AGG(a.from_date || ' to ' || a.to_date, ', '), 'No Availability') AS availability
FROM public.person p
LEFT JOIN public.competence_profile c ON p.person_id = c.person_id
LEFT JOIN public.competence comp ON c.competence_id = comp.competence_id
LEFT JOIN public.availability a ON p.person_id = a.person_id
WHERE p.status != 'unsent' 
AND p.role_id = 2        
GROUP BY p.person_id, p.name, p.surname, p.email, p.status, p.last_updated;
