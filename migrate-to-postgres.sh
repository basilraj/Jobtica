#!/bin/bash

# PostgreSQL Migration Script
# Converts MySQL queries to PostgreSQL syntax for Vercel + Neon setup

echo "🔄 Converting API files to PostgreSQL compatibility..."

# Function to convert MySQL syntax to PostgreSQL
convert_to_postgres() {
    local file="$1"
    echo "Converting $file..."
    
    # Replace table names with quoted names
    sed -i 's/FROM User/FROM "User"/g' "$file"
    sed -i 's/INSERT INTO User/INSERT INTO "User"/g' "$file"
    sed -i 's/UPDATE User/UPDATE "User"/g' "$file"
    sed -i 's/DELETE FROM User/DELETE FROM "User"/g' "$file"
    
    sed -i 's/FROM Job/FROM "Job"/g' "$file"
    sed -i 's/INSERT INTO Job/INSERT INTO "Job"/g' "$file"
    sed -i 's/UPDATE Job/UPDATE "Job"/g' "$file"
    sed -i 's/DELETE FROM Job/DELETE FROM "Job"/g' "$file"
    
    sed -i 's/FROM ContentPost/FROM "ContentPost"/g' "$file"
    sed -i 's/INSERT INTO ContentPost/INSERT INTO "ContentPost"/g' "$file"
    sed -i 's/UPDATE ContentPost/UPDATE "ContentPost"/g' "$file"
    sed -i 's/DELETE FROM ContentPost/DELETE FROM "ContentPost"/g' "$file"
    
    sed -i 's/FROM QuickLink/FROM "QuickLink"/g' "$file"
    sed -i 's/INSERT INTO QuickLink/INSERT INTO "QuickLink"/g' "$file"
    sed -i 's/UPDATE QuickLink/UPDATE "QuickLink"/g' "$file"
    sed -i 's/DELETE FROM QuickLink/DELETE FROM "QuickLink"/g' "$file"
    
    sed -i 's/FROM Subscriber/FROM "Subscriber"/g' "$file"
    sed -i 's/INSERT INTO Subscriber/INSERT INTO "Subscriber"/g' "$file"
    sed -i 's/UPDATE Subscriber/UPDATE "Subscriber"/g' "$file"
    sed -i 's/DELETE FROM Subscriber/DELETE FROM "Subscriber"/g' "$file"
    
    sed -i 's/FROM BreakingNews/FROM "BreakingNews"/g' "$file"
    sed -i 's/INSERT INTO BreakingNews/INSERT INTO "BreakingNews"/g' "$file"
    sed -i 's/UPDATE BreakingNews/UPDATE "BreakingNews"/g' "$file"
    sed -i 's/DELETE FROM BreakingNews/DELETE FROM "BreakingNews"/g' "$file"
    
    sed -i 's/FROM SponsoredAd/FROM "SponsoredAd"/g' "$file"
    sed -i 's/INSERT INTO SponsoredAd/INSERT INTO "SponsoredAd"/g' "$file"
    sed -i 's/UPDATE SponsoredAd/UPDATE "SponsoredAd"/g' "$file"
    sed -i 's/DELETE FROM SponsoredAd/DELETE FROM "SponsoredAd"/g' "$file"
    
    sed -i 's/FROM ActivityLog/FROM "ActivityLog"/g' "$file"
    sed -i 's/INSERT INTO ActivityLog/INSERT INTO "ActivityLog"/g' "$file"
    sed -i 's/UPDATE ActivityLog/UPDATE "ActivityLog"/g' "$file"
    sed -i 's/DELETE FROM ActivityLog/DELETE FROM "ActivityLog"/g' "$file"
    
    sed -i 's/FROM ContactSubmission/FROM "ContactSubmission"/g' "$file"
    sed -i 's/INSERT INTO ContactSubmission/INSERT INTO "ContactSubmission"/g' "$file"
    sed -i 's/UPDATE ContactSubmission/UPDATE "ContactSubmission"/g' "$file"
    sed -i 's/DELETE FROM ContactSubmission/DELETE FROM "ContactSubmission"/g' "$file"
    
    sed -i 's/FROM EmailNotification/FROM "EmailNotification"/g' "$file"
    sed -i 's/INSERT INTO EmailNotification/INSERT INTO "EmailNotification"/g' "$file"
    sed -i 's/UPDATE EmailNotification/UPDATE "EmailNotification"/g' "$file"
    sed -i 's/DELETE FROM EmailNotification/DELETE FROM "EmailNotification"/g' "$file"
    
    sed -i 's/FROM CustomEmail/FROM "CustomEmail"/g' "$file"
    sed -i 's/INSERT INTO CustomEmail/INSERT INTO "CustomEmail"/g' "$file"
    sed -i 's/UPDATE CustomEmail/UPDATE "CustomEmail"/g' "$file"
    sed -i 's/DELETE FROM CustomEmail/DELETE FROM "CustomEmail"/g' "$file"
    
    sed -i 's/FROM EmailTemplate/FROM "EmailTemplate"/g' "$file"
    sed -i 's/INSERT INTO EmailTemplate/INSERT INTO "EmailTemplate"/g' "$file"
    sed -i 's/UPDATE EmailTemplate/UPDATE "EmailTemplate"/g' "$file"
    sed -i 's/DELETE FROM EmailTemplate/DELETE FROM "EmailTemplate"/g' "$file"
    
    sed -i 's/FROM PreparationCourse/FROM "PreparationCourse"/g' "$file"
    sed -i 's/INSERT INTO PreparationCourse/INSERT INTO "PreparationCourse"/g' "$file"
    sed -i 's/UPDATE PreparationCourse/UPDATE "PreparationCourse"/g' "$file"
    sed -i 's/DELETE FROM PreparationCourse/DELETE FROM "PreparationCourse"/g' "$file"
    
    sed -i 's/FROM PreparationBook/FROM "PreparationBook"/g' "$file"
    sed -i 's/INSERT INTO PreparationBook/INSERT INTO "PreparationBook"/g' "$file"
    sed -i 's/UPDATE PreparationBook/UPDATE "PreparationBook"/g' "$file"
    sed -i 's/DELETE FROM PreparationBook/DELETE FROM "PreparationBook"/g' "$file"
    
    sed -i 's/FROM UpcomingExam/FROM "UpcomingExam"/g' "$file"
    sed -i 's/INSERT INTO UpcomingExam/INSERT INTO "UpcomingExam"/g' "$file"
    sed -i 's/UPDATE UpcomingExam/UPDATE "UpcomingExam"/g' "$file"
    sed -i 's/DELETE FROM UpcomingExam/DELETE FROM "UpcomingExam"/g' "$file"
    
    sed -i 's/FROM KeyValueStore/FROM "KeyValueStore"/g' "$file"
    sed -i 's/INSERT INTO KeyValueStore/INSERT INTO "KeyValueStore"/g' "$file"
    sed -i 's/UPDATE KeyValueStore/UPDATE "KeyValueStore"/g' "$file"
    sed -i 's/DELETE FROM KeyValueStore/DELETE FROM "KeyValueStore"/g' "$file"
    
    # Update column names from camelCase to snake_case
    sed -i 's/passwordHash/password_hash/g' "$file"
    sed -i 's/createdAt/created_at/g' "$file"
    sed -i 's/updatedAt/updated_at/g' "$file"
    sed -i 's/isAdmin/is_admin/g' "$file"
    sed -i 's/applicationLink/application_link/g' "$file"
    sed -i 's/affiliateCoursesJson/affiliate_courses_json/g' "$file"
    sed -i 's/affiliateBooksJson/affiliate_books_json/g' "$file"
    sed -i 's/isActive/is_active/g' "$file"
    sed -i 's/orderIndex/order_index/g' "$file"
    sed -i 's/featuredImage/featured_image/g' "$file"
    sed -i 's/subscriptionDate/subscription_date/g' "$file"
    sed -i 's/userId/user_id/g' "$file"
    sed -i 's/ipAddress/ip_address/g' "$file"
    sed -i 's/imageUrl/image_url/g' "$file"
    sed -i 's/linkUrl/link_url/g' "$file"
    sed -i 's/startDate/start_date/g' "$file"
    sed -i 's/endDate/end_date/g' "$file"
    sed -i 's/costPerClick/cost_per_click/g' "$file"
    sed -i 's/submittedAt/submitted_at/g' "$file"
    sed -i 's/isRead/is_read/g' "$file"
    sed -i 's/repliedAt/replied_at/g' "$file"
    sed -i 's/sentAt/sent_at/g' "$file"
    sed -i 's/errorMessage/error_message/g' "$file"
    sed -i 's/recipientCount/recipient_count/g' "$file"
    sed -i 's/isActive/is_active/g' "$file"
    sed -i 's/enrollmentLink/enrollment_link/g' "$file"
    sed -i 's/studentCount/student_count/g' "$file"
    sed -i 's/reviewCount/review_count/g' "$file"
    sed -i 's/examDate/exam_date/g' "$file"
    sed -i 's/applicationStart/application_start/g' "$file"
    sed -i 's/applicationEnd/application_end/g' "$file"
    sed -i 's/officialLink/official_link/g' "$file"
    sed -i 's/expiresAt/expires_at/g' "$file"
    sed -i 's/ON UPDATE CURRENT_TIMESTAMP//g' "$file"
}

# Convert all API route files
echo "Converting API route files..."
convert_to_postgres "api/routes/auth.js"
convert_to_postgres "api/routes/content.js"
convert_to_postgres "api/routes/audience.js"
convert_to_postgres "api/routes/marketing.js"
convert_to_postgres "api/routes/preparation.js"
convert_to_postgres "api/routes/system.js"
convert_to_postgres "api/routes/core.js"

echo "✅ PostgreSQL conversion completed!"
echo
echo "⚠️  Manual fixes needed:"
echo "1. Replace uuidv4() with gen_random_uuid() for PostgreSQL"
echo "2. Update JSON field handling for PostgreSQL"
echo "3. Review and test all API endpoints"
echo
echo "Next steps:"
echo "1. Update database connection in lib/postgres.js"
echo "2. Run schema.sql against your Neon database"
echo "3. Test the application"