
//we can set animation delay as following in ms (default 1000)
ProgressBar.singleStepAnimation = 1500;
ProgressBar.init(
  [ 'Request Submitted',
    'Received Responses',
    'Negotiation Done',
    'Hired Professional',
  ],
  'Hired Professional',
  'progress-bar-wrapper' // created this optional parameter for container name (otherwise default container created)
);