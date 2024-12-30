# API Documentation

## Authentication
All endpoints require JWT authentication. Include the JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

## Endpoints

### Assessments

#### Create Assessment
```http
POST /api/assessments/
```

**Request Body:**
```json
{
  "patient_id": "integer",
  "assessment_type": "string (initial|follow_up|discharge)",
  "observations": "string",
  "measurements": "json",
  "goals": "json"
}
```

**Response:**
```json
{
  "id": "integer",
  "patient_id": "integer",
  "therapist_id": "integer",
  "assessment_type": "string",
  "status": "string",
  "observations": "string",
  "measurements": "json",
  "goals": "json",
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

#### List Assessments
```http
GET /api/assessments/
```

**Query Parameters:**
- `skip` (integer, optional): Number of records to skip (default: 0)
- `limit` (integer, optional): Number of records to return (default: 100)
- `patient_id` (integer, optional): Filter by patient ID

#### Get Assessment
```http
GET /api/assessments/{assessment_id}
```

#### Update Assessment
```http
PUT /api/assessments/{assessment_id}
```

**Request Body:**
```json
{
  "observations": "string",
  "measurements": "json",
  "goals": "json",
  "status": "string"
}
```

#### Delete Assessment
```http
DELETE /api/assessments/{assessment_id}
```

#### Process Assessment
```http
POST /api/assessments/{assessment_id}/process
```
Triggers AI processing of the assessment.

#### Get Assessment Results
```http
GET /api/assessments/{assessment_id}/results
```

### Patients

#### Create Patient
```http
POST /api/patients/
```

**Request Body:**
```json
{
  "first_name": "string",
  "last_name": "string",
  "date_of_birth": "date",
  "gender": "string",
  "contact_number": "string",
  "email": "string",
  "address": "string",
  "medical_history": "string"
}
```

[Additional endpoint documentation to be added based on other API files]

## Error Responses

All endpoints may return the following errors:

### 401 Unauthorized
```json
{
  "detail": "Could not validate credentials"
}
```

### 403 Forbidden
```json
{
  "detail": "Not authorized to perform this action"
}
```

### 404 Not Found
```json
{
  "detail": "Resource not found"
}
```

### 422 Validation Error
```json
{
  "detail": [
    {
      "loc": ["body", "field_name"],
      "msg": "field required",
      "type": "value_error.missing"
    }
  ]
}
```

## Rate Limiting
- 100 requests per minute per user
- 1000 requests per hour per user

## Data Types

### Assessment Types
- `initial`: Initial patient assessment
- `follow_up`: Follow-up assessment
- `discharge`: Discharge assessment

### Assessment Status
- `scheduled`: Planned but not started
- `in_progress`: Currently being conducted
- `completed`: Finished assessment
- `cancelled`: Cancelled assessment

### User Roles
- `admin`: System administrator
- `therapist`: Clinical therapist
- `supervisor`: Clinical supervisor