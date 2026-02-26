# Requirements Document

## Introduction

The Delivery Management System is a dedicated feature for tracking and managing the delivery of lehenga orders. Currently, orders are manually marked as "Delivered" on the Orders page without capturing delivery details or maintaining an audit trail. This feature introduces a dedicated Delivery page that provides a centralized view of orders ready for delivery, captures comprehensive delivery information, automatically updates order status across the system, and generates professional delivery receipts.

## Glossary

- **Delivery_System**: The new delivery management feature including the UI page, API endpoints, and data models
- **Order**: A lehenga order record in the system with customer details, payment information, and status
- **Production_Record**: A record tracking the production status, tailor assignment, and storage location of an order
- **Ready_Order**: An order with status "Ready" that has completed production and is awaiting delivery
- **Delivery_Info**: The collection of data captured when marking an order as delivered
- **Delivery_Receipt**: A formatted document containing order, customer, payment, and delivery details
- **Staff_User**: A user with staff or admin role who can manage deliveries
- **Delivery_Modal**: The popup form used to capture delivery information
- **Order_Status**: The current state of an order (Pending, In Production, Ready, Delivered)

## Requirements

### Requirement 1: Delivery Page Navigation

**User Story:** As a staff user, I want to access the Delivery page from the main navigation, so that I can quickly manage deliveries without searching through other pages.

#### Acceptance Criteria

1. THE Delivery_System SHALL add a "Delivery" menu item in the Sidebar between "Production" and "Tailors"
2. THE Delivery_System SHALL use a Truck icon from lucide-react for the Delivery menu item
3. WHEN a Staff_User navigates to the Delivery page, THE Delivery_System SHALL highlight the Delivery menu item as active
4. THE Delivery_System SHALL make the Delivery page accessible at the route "/dashboard/delivery"
5. THE Delivery_System SHALL allow both admin and staff roles to access the Delivery page

### Requirement 2: Display Ready Orders

**User Story:** As a staff user, I want to see all orders that are ready for delivery in one place, so that I can efficiently manage the delivery process.

#### Acceptance Criteria

1. WHEN a Staff_User opens the Delivery page, THE Delivery_System SHALL display a "Ready for Delivery" section
2. THE Delivery_System SHALL display all Order records with status "Ready" in the "Ready for Delivery" section
3. FOR EACH Ready_Order, THE Delivery_System SHALL display the order ID, customer name, customer phone, delivery date, and total amount
4. THE Delivery_System SHALL display a statistics card showing the count of Ready_Order records
5. THE Delivery_System SHALL update the Ready_Order list in real-time when Production_Record status changes to "Ready"
6. THE Delivery_System SHALL sort Ready_Order records by delivery date in ascending order

### Requirement 3: Display Delivered Orders

**User Story:** As a staff user, I want to see all delivered orders with their delivery details, so that I can track completed deliveries and access delivery information.

#### Acceptance Criteria

1. WHEN a Staff_User opens the Delivery page, THE Delivery_System SHALL display a "Delivered Orders" section
2. THE Delivery_System SHALL display all Order records with status "Delivered" in the "Delivered Orders" section
3. FOR EACH delivered Order, THE Delivery_System SHALL display the order ID, customer name, delivered date, delivered by, and delivery person name
4. THE Delivery_System SHALL display a statistics card showing the count of Order records delivered today
5. THE Delivery_System SHALL display a statistics card showing the total count of all delivered Order records
6. THE Delivery_System SHALL sort delivered Order records by delivered date in descending order

### Requirement 4: Search and Filter Deliveries

**User Story:** As a staff user, I want to search and filter orders on the Delivery page, so that I can quickly find specific orders or deliveries.

#### Acceptance Criteria

1. THE Delivery_System SHALL provide a search input field that filters Order records by order ID or customer name
2. THE Delivery_System SHALL provide a date range filter that filters Order records by delivery date or delivered date
3. WHEN a Staff_User enters text in the search field, THE Delivery_System SHALL display only Order records matching the search criteria
4. WHEN a Staff_User selects a date range, THE Delivery_System SHALL display only Order records within the selected date range
5. THE Delivery_System SHALL apply filters to both "Ready for Delivery" and "Delivered Orders" sections independently
6. THE Delivery_System SHALL display a count of filtered results in each section

### Requirement 5: Capture Delivery Information

**User Story:** As a staff user, I want to capture comprehensive delivery details when marking an order as delivered, so that we maintain accurate delivery records and payment tracking.

#### Acceptance Criteria

1. WHEN a Staff_User clicks "Mark as Delivered" on a Ready_Order, THE Delivery_System SHALL display a Delivery_Modal
2. THE Delivery_Modal SHALL display a date picker field for "Delivered Date" with default value set to the current date
3. THE Delivery_Modal SHALL display a dropdown or input field for "Delivered By" to capture the person who handed over the order
4. THE Delivery_Modal SHALL display an editable field for "Remaining Payment Amount" pre-filled with the Order remainingDue value
5. THE Delivery_Modal SHALL display an input field for "Delivery Person Name" to capture who physically delivered the order
6. THE Delivery_Modal SHALL display an input field for "Delivery Person Mobile Number" with phone number validation
7. THE Delivery_Modal SHALL display an optional input field for "Video Review URL" to capture customer feedback links
8. THE Delivery_Modal SHALL display an optional text area for "Delivery Notes"
9. WHEN the Delivery Person Mobile Number field contains invalid data, THE Delivery_System SHALL display a validation error message
10. THE Delivery_Modal SHALL require all mandatory fields (Delivered Date, Delivered By, Delivery Person Name, Delivery Person Mobile Number) before submission

### Requirement 6: Update Order Status on Delivery

**User Story:** As a staff user, I want the order status to automatically update to "Delivered" when I mark it as delivered, so that all pages reflect the current status without manual updates.

#### Acceptance Criteria

1. WHEN a Staff_User submits the Delivery_Modal, THE Delivery_System SHALL update the Order status to "Delivered"
2. THE Delivery_System SHALL save all Delivery_Info fields to the Order deliveryInfo object
3. THE Delivery_System SHALL update the Order record in the database within 2 seconds of submission
4. WHEN the Order status is updated to "Delivered", THE Delivery_System SHALL remove the Order from the "Ready for Delivery" section
5. WHEN the Order status is updated to "Delivered", THE Delivery_System SHALL add the Order to the "Delivered Orders" section
6. THE Delivery_System SHALL display a success notification message after successfully marking an Order as delivered
7. IF the database update fails, THEN THE Delivery_System SHALL display an error message and keep the Order in "Ready for Delivery" status

### Requirement 7: Maintain Data Consistency Across Pages

**User Story:** As a staff user, I want all pages to show consistent order status information, so that I can trust the data regardless of which page I'm viewing.

#### Acceptance Criteria

1. WHEN an Order status is updated to "Delivered" on the Delivery page, THE Delivery_System SHALL ensure the Orders page displays the updated status
2. WHEN an Order status is updated to "Delivered" on the Delivery page, THE Delivery_System SHALL ensure the Production page displays the updated status
3. WHEN a Production_Record is marked as "Ready", THE Delivery_System SHALL ensure the Order appears in the "Ready for Delivery" section within 2 seconds
4. THE Delivery_System SHALL maintain referential integrity between Order and Production_Record collections
5. FOR ALL Order records, THE Delivery_System SHALL ensure the status field accurately reflects the current state

### Requirement 8: Generate Delivery Receipt

**User Story:** As a staff user, I want to generate and download a professional delivery receipt, so that I can provide documentation to customers and maintain records.

#### Acceptance Criteria

1. WHEN a Staff_User views a delivered Order, THE Delivery_System SHALL display a "Generate Receipt" button
2. WHEN a Staff_User clicks "Generate Receipt", THE Delivery_System SHALL create a Delivery_Receipt containing order information, customer information, payment breakdown, and delivery details
3. THE Delivery_Receipt SHALL include the order ID, customer name, customer phone, order date, and delivery date
4. THE Delivery_Receipt SHALL include the total amount, first advance amount and method, second advance amount, and remaining payment amount
5. THE Delivery_Receipt SHALL include the delivered by name, delivery person name, delivery person mobile number, and delivery notes
6. THE Delivery_System SHALL format the Delivery_Receipt with professional styling matching the existing receipt style
7. THE Delivery_System SHALL allow the Staff_User to download the Delivery_Receipt as an HTML or PDF file
8. THE Delivery_Receipt SHALL display the application branding and contact information

### Requirement 9: Extend Order Data Model

**User Story:** As a developer, I want the Order schema to include delivery information fields, so that delivery data is properly stored and retrievable.

#### Acceptance Criteria

1. THE Delivery_System SHALL add a deliveryInfo object to the Order schema
2. THE deliveryInfo object SHALL include a deliveredDate field of type Date
3. THE deliveryInfo object SHALL include a deliveredBy field of type String
4. THE deliveryInfo object SHALL include a remainingPaymentAmount field of type Number
5. THE deliveryInfo object SHALL include a deliveryPersonName field of type String
6. THE deliveryInfo object SHALL include a deliveryPersonMobile field of type String
7. THE deliveryInfo object SHALL include a videoReviewUrl field of type String with default value null
8. THE deliveryInfo object SHALL include a deliveryNotes field of type String with default value empty string
9. THE Delivery_System SHALL maintain backward compatibility with existing Order records that do not have deliveryInfo
10. WHEN an Order record without deliveryInfo is retrieved, THE Delivery_System SHALL return null or empty values for delivery fields without errors

### Requirement 10: Responsive User Interface

**User Story:** As a staff user, I want the Delivery page to work well on mobile devices, so that I can manage deliveries from any device.

#### Acceptance Criteria

1. WHEN a Staff_User accesses the Delivery page on a mobile device, THE Delivery_System SHALL display a mobile-optimized layout
2. THE Delivery_System SHALL ensure all interactive elements (buttons, inputs, modals) are touch-friendly with minimum 44x44 pixel touch targets
3. THE Delivery_System SHALL ensure the Delivery_Modal is fully visible and usable on mobile screens
4. THE Delivery_System SHALL ensure order lists are scrollable and readable on mobile devices
5. THE Delivery_System SHALL ensure statistics cards stack vertically on mobile devices
6. THE Delivery_System SHALL maintain the brown gradient theme (#975a20 to #7d4a1a) across all screen sizes

### Requirement 11: Visual Design Consistency

**User Story:** As a staff user, I want the Delivery page to match the existing application design, so that the interface feels cohesive and familiar.

#### Acceptance Criteria

1. THE Delivery_System SHALL apply the brown gradient theme (#975a20 to #7d4a1a) to primary UI elements
2. THE Delivery_System SHALL use the same typography, spacing, and component styles as existing pages
3. THE Delivery_System SHALL use consistent button styles for primary and secondary actions
4. THE Delivery_System SHALL use consistent card styles for statistics and order displays
5. THE Delivery_System SHALL use consistent form input styles in the Delivery_Modal
6. THE Delivery_System SHALL display loading states with spinners or skeleton screens matching existing patterns
7. THE Delivery_System SHALL display error messages with consistent styling and positioning

### Requirement 12: Delivery Audit Trail

**User Story:** As an admin, I want to track who delivered each order and when, so that I can maintain accountability and resolve delivery disputes.

#### Acceptance Criteria

1. FOR EACH delivered Order, THE Delivery_System SHALL record the Staff_User who marked it as delivered
2. FOR EACH delivered Order, THE Delivery_System SHALL record the timestamp when it was marked as delivered
3. THE Delivery_System SHALL display the delivered by information in the Delivered Orders section
4. THE Delivery_System SHALL display the delivered date in the Delivered Orders section
5. THE Delivery_System SHALL preserve delivery information and prevent modification after an Order is marked as delivered
6. THE Delivery_System SHALL allow admin users to view the complete delivery history for any Order

### Requirement 13: API Endpoints for Delivery Operations

**User Story:** As a developer, I want RESTful API endpoints for delivery operations, so that the frontend can interact with delivery data consistently.

#### Acceptance Criteria

1. THE Delivery_System SHALL provide a GET endpoint at "/api/delivery/ready" that returns all Ready_Order records
2. THE Delivery_System SHALL provide a GET endpoint at "/api/delivery/delivered" that returns all delivered Order records
3. THE Delivery_System SHALL provide a POST endpoint at "/api/delivery/mark-delivered" that accepts Delivery_Info and updates Order status
4. THE Delivery_System SHALL provide a GET endpoint at "/api/delivery/receipt/[orderId]" that returns Delivery_Receipt data
5. WHEN an API endpoint receives invalid data, THE Delivery_System SHALL return a 400 status code with a descriptive error message
6. WHEN an API endpoint encounters a server error, THE Delivery_System SHALL return a 500 status code with an error message
7. THE Delivery_System SHALL validate authentication and authorization for all API endpoints
8. THE Delivery_System SHALL return JSON responses with consistent structure across all endpoints

### Requirement 14: Error Handling and User Feedback

**User Story:** As a staff user, I want clear feedback when operations succeed or fail, so that I know whether my actions were completed successfully.

#### Acceptance Criteria

1. WHEN a delivery operation succeeds, THE Delivery_System SHALL display a success notification with a confirmation message
2. WHEN a delivery operation fails, THE Delivery_System SHALL display an error notification with a descriptive error message
3. WHEN the Delivery_System is loading data, THE Delivery_System SHALL display a loading indicator
4. WHEN the Delivery_System encounters a network error, THE Delivery_System SHALL display a user-friendly error message
5. WHEN form validation fails in the Delivery_Modal, THE Delivery_System SHALL highlight invalid fields and display validation messages
6. THE Delivery_System SHALL automatically dismiss success notifications after 3 seconds
7. THE Delivery_System SHALL keep error notifications visible until the Staff_User dismisses them

### Requirement 15: Performance and Data Loading

**User Story:** As a staff user, I want the Delivery page to load quickly and respond smoothly, so that I can work efficiently without delays.

#### Acceptance Criteria

1. WHEN a Staff_User opens the Delivery page, THE Delivery_System SHALL load and display order data within 2 seconds on a standard network connection
2. THE Delivery_System SHALL paginate order lists when the count exceeds 50 records
3. THE Delivery_System SHALL implement client-side caching to reduce redundant API calls
4. WHEN a Staff_User submits the Delivery_Modal, THE Delivery_System SHALL update the UI within 1 second of receiving the server response
5. THE Delivery_System SHALL debounce search input to avoid excessive API calls during typing
6. THE Delivery_System SHALL optimize database queries to retrieve only necessary fields for list views
