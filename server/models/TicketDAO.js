export class Ticket {
  constructor({
    id,
    service_id,
    counter_id,
    status,
    queue_date,
    issue_time,
    serve_time,
    end_time
  }) {
    this.id = id;
    this.serviceId = service_id;
    this.counterId = counter_id;
    this.status = status;
    this.queueDate = queue_date;
    this.issueTime = issue_time;
    this.serveTime = serve_time;
    this.endTime = end_time;
  }
}