# FreelanTZer

- FreelanTZer is a Decentralized Application built on top of the Tezos Network. 
- It enables users to post jobs, and deposit the stipend amount at the time of listing the job, which is then stored in the contract. 
- Candidates may apply for the job with their accounts.
- The job owner will then select candidates suitable for the role.
- At the completion of the contract between the employee and the employer, the stipend amount will automatically be transferred to the employee, which was stored in the contract at the time of job creation.

# Current Features

- Currently, test accounts have been hard-coded inside the code for convenience. Listing of jobs can be done using one of the test accounts.
- Every job gets a unique Job ID once created, and candidates can apply using this job ID. Again, a test account will be used for applying.
- After receiving applications, the owner can see the addresses of all the applicants, and can hire a candidate using his address.
- At the successful completion of the contract, the stipend amount that was initially deposited would be transferred to the candidate.
- Currently, this is the exact pattern that has to be followed, LIST, APPLY, HIRE, TRANSFER_STIPEND.

# Future Scope

- Integration with a browser wallet and/or keystore input from the user instead of hard-coded accounts for both listing and applying for jobs.
- Currently, everyone is able to see all the jobs and all the applications. Instead, it should be the case that everyone is only able to see the listings on the UI, and owners should be able to see the applicants and applicants should be able to see the jobs they've applied to.
- Dispute Resolution mechanisms in case any party behaves maliciously.
- Owners should be able to delete a job if and only if there has been no candidate hired yet.
- The list operation is currently hard-coded with all the details. Ideally, this input which has the company name, contact, job description etc. should be taken as user input, but has been hard-coded for convenience.
- The apply operation too is hardcoded, ideally a link to the resume should be submitted by the applicant.
- Uploading of job description and resumes to IPFS and using those links in the contract storage.

# Prerequisites

- Python 3.x +
- Node v12.x +

# Steps to Execute

- Clone the repository.
- Run ```npm i``` to install the dependencies required.
- Run ```npm run client-install``` to install client dependencies for React.
- Click on list to execute a job listing function. Once the transaction is sent, you'll see an operation group ID at the top, which you can then explore on https://carthagenet.tzstats.com/. Please give a few seconds(30 - 60) for the transaction to be registered on the chain and refresh to see the changes.
- The next step is to apply for a job, copy the ID of the job you recently listed and paste it in the input box in the Apply for jobs section and click on Apply. Please give a few seconds(30 - 60) for the transaction to be registered on the chain and refresh to see the changes.
- After applying, you may go ahead and hire that candidate for the role. You'll find the list of applicants for a role, which has their account address. Copy this account address and enter it into the Hire input box and click on Hire.
- After the changes have been reflected, you can click on transfer stipend to send the stipend amount to the selected candidate. This will initiate a tezos transfer transaction on the network and at the same time delete the job listing.

# Tech Stack

- Smartpy for Smart Contract Coding.
- Bundle React Framework for developing the client application for the DApp and conseiljs for interacting with the Tezos Blockchain.

# Note

- This is a very minimum viable product and lot of things are yet to be implemented. Feel free to create a pull request!
