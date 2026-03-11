## Vehicle Domain Relationships

- **Accounts → Vehicles**: Each vehicle belongs to a single account (`vehicles.account_id → accounts.id`).
- **Vehicles → Maintenance Logs**: Each maintenance log is tied to exactly one vehicle and account (`maintenance_logs.vehicle_id`, `maintenance_logs.account_id`).
- **Vehicles → Fuel Logs**: Each fuel log is tied to exactly one vehicle and account (`fuel_logs.vehicle_id`, `fuel_logs.account_id`).
- **Vehicles → Vehicle Images**: Each image belongs to a single vehicle and account (`vehicle_images.vehicle_id`, `vehicle_images.account_id`), with optional `storage_bucket`/`storage_key` for InsForge storage and a `url` used by the frontend.
- **Vehicles → Vehicle Health Snapshots**: Each snapshot captures a computed health score for one vehicle and account at a point in time (`vehicle_health_snapshots.vehicle_id`, `vehicle_health_snapshots.account_id`).

