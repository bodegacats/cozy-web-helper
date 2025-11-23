-- Phase 1: Drop broken triggers and function (with CASCADE)
DROP TRIGGER IF EXISTS on_request_created ON update_requests;
DROP TRIGGER IF EXISTS on_request_status_changed ON update_requests;
DROP FUNCTION IF EXISTS notify_request_change() CASCADE;

-- Phase 2: Add email normalization triggers to leads and project_intakes
CREATE TRIGGER normalize_leads_email
  BEFORE INSERT OR UPDATE ON leads
  FOR EACH ROW
  EXECUTE FUNCTION normalize_email();

CREATE TRIGGER normalize_intakes_email
  BEFORE INSERT OR UPDATE ON project_intakes
  FOR EACH ROW
  EXECUTE FUNCTION normalize_email();