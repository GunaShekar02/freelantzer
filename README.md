# FreelanTZer

- FreelanTZer is a Decentralized Application for freelancers built on top of the Tezos Network. 
- It enables users to post jobs, and deposit the stipend amount at the time of listing the job, which is then stored in the contract. 
- Candidates may apply for the job with their accounts.
- The job owner will then select candidates suitable for the role.
- At the completion of the contract between the employee and the employer, the stipend amount will automatically be transferred to the employee, which was stored in the contract at the time of job creation.

# Current Features

- Users may list jobs by clicking on the "List" button on the home page. They will have to enter the details of the job and authenticate the transaction using Thanos Wallet.
- Existing jobs appear on the home screen along with their basic job details. Users may apply on those jobs by clicking on the apply button. They will have to authenticate the transaction using the Thanos Wallet.
- Users can see the jobs that they listed in the "My Job Listings" tab. They can hire suitable candidates from that list. Once candidates are hired and the contract has ended, they can transfer the stipend.
- Candidates can view the jobs that they applied for from the "My Applications" tab. There they will find the status of the application(Applied/Accepted/Rejected).

# Future Scope

- Dispute Resolution mechanisms in case any party behaves maliciously.
- Owners should be able to delete a job if and only if there has been no candidate hired yet.
- Uploading of job description and resumes to IPFS and using those links in the contract storage.
- Validation checks for empty and unsanitary inputs.

# Prerequisites

- Python 3.x +
- Node v12.x +

# Steps to Execute

- Clone the repository.
- Run ```npm i``` to install the dependencies required.
- Run ```npm run client-install``` to install client dependencies for React.
- Run ```npm run dapp``` to start the React App.
- Click on "List", which will open up a modal where you have to enter basic details regarding the job along with the stipend amount. Make sure your account has the stipend amount and click on "List" to execute a job listing function. Once the transaction is sent, you'll see an operation group ID at the top, which you can then explore on https://carthagenet.tzstats.com/. Please give a few seconds(30 - 60) for the transaction to be registered on the chain and refresh to see the changes.
- The jobs are listed on the home page along with an "Apply" button. Click on the apply button and enter a link to your resume to apply for the job.
- You may view the jobs that you listed in the "My Job Listings" tab. You'll find the list of candidates that have applied for the job and an option to hire a particular candidate. Click on the "Hire" button below a particular application to hire that person.
- After the changes have been reflected, you can click on transfer stipend to send the stipend amount to the selected candidate. This will initiate a tezos transfer transaction on the network.

# Tech Stack

- Smartpy for Smart Contract.
- Bundle React Framework for developing the client application for the DApp and Conseiljs, Taquito and Thanos Wallet for interacting with the Tezos Blockchain.
