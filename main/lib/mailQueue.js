import redisClient from './redis.js';

export async function queueCancellationEmail(orderNumber, reason, customerName) {
  const job = {
    to: 'yashpouranik124@gmail.com',
    subject: `Order Cancellation Ticket — #${orderNumber}`,
    html: `
      <div style="font-family: sans-serif; padding: 20px; line-height: 1.6; max-width: 600px; margin: auto; border: 1px solid #eee; border-radius: 8px; color: #333;">
        <h2 style="color: #c62828;">New Cancellation Ticket</h2>
        <p>Hello Admin,</p>
        <p>A customer has requested cancellation for order <strong>#${orderNumber}</strong>.</p>
        <div style="background: #ffebee; border: 1px solid #ffcdd2; padding: 15px; border-radius: 6px; margin: 15px 0;">
          <p style="margin: 0;"><strong>Customer Name:</strong> ${customerName}</p>
          <p style="margin: 5px 0 0 0;"><strong>Reason for Cancel:</strong> ${reason}</p>
        </div>
        <p>Please log in to your Kinzee Atelier Admin Dashboard to review and resolve this ticket request.</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="font-size: 11px; color: #888; text-align: center;">Candle by Kinzee Atelier</p>
      </div>
    `
  };

  await enqueueJob(job, `Enqueued cancellation mail job for #${orderNumber}`);
}

export async function queueCancellationResultEmail(orderNumber, customerEmail, customerName, isApproved) {
  const statusColor = isApproved ? '#2e7d32' : '#c62828';
  const statusText = isApproved ? 'Accepted' : 'Declined';
  const nextSteps = isApproved 
    ? 'If you have already paid for your order, your refund will be processed back to your original payment method within 5 working days.'
    : 'Your order is past the point of cancellation as our studio has already begun handcrafting it or preparing it for dispatch. It will proceed as originally planned.';

  const job = {
    to: customerEmail,
    subject: `Update on your Cancellation Request — #${orderNumber}`,
    html: `
      <div style="font-family: sans-serif; padding: 20px; line-height: 1.6; max-width: 600px; margin: auto; border: 1px solid #eee; border-radius: 8px; color: #333;">
        <h2 style="color: ${statusColor};">Cancellation ${statusText}</h2>
        <p>Hello ${customerName},</p>
        <p>Your request to cancel order <strong>#${orderNumber}</strong> has been <strong>${statusText.toLowerCase()}</strong> by our studio team.</p>
        <div style="background: #f9f9f9; border: 1px solid #ddd; padding: 15px; border-radius: 6px; margin: 15px 0;">
          <p style="margin: 0;">${nextSteps}</p>
        </div>
        <p>If you have any questions or concerns, please reach out to our support team.</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="font-size: 11px; color: #888; text-align: center;">Candle by Kinzee Atelier</p>
      </div>
    `
  };

  await enqueueJob(job, `Enqueued cancellation result mail job for #${orderNumber} to ${customerEmail}`);
}

async function enqueueJob(job, logMessage) {
  try {
    const isRedisLive = !!process.env.REDIS_URL;
    
    if (isRedisLive) {
      await global.redisInstance.rpush('mail_queue', JSON.stringify(job));
    } else {
      if (!global.mockMailQueue) global.mockMailQueue = [];
      global.mockMailQueue.push(job);
    }
    
    console.log('[Mail Queue] ' + logMessage);

    setTimeout(() => {
      processMailQueue().catch(err => console.error('[Mail Queue Processor Error]:', err));
    }, 100);

  } catch (err) {
    console.error('[Mail Queue Enqueue Error]:', err);
  }
}

export async function processMailQueue() {
  try {
    const isRedisLive = !!process.env.REDIS_URL;
    let jobData = null;

    if (isRedisLive) {
      jobData = await global.redisInstance.lpop('mail_queue');
    } else {
      if (global.mockMailQueue && global.mockMailQueue.length > 0) {
        jobData = JSON.stringify(global.mockMailQueue.shift());
      }
    }

    if (!jobData) return;

    const job = JSON.parse(jobData);
    const { sendMail } = await import('./services/notificationService.js');
    await sendMail(job.to, job.subject, job.html);
    console.log(`[Mail Queue Worker] Successfully processed and sent email to ${job.to}`);
  } catch (err) {
    console.error('[Mail Queue Worker Error]:', err);
    throw err;
  }
}
