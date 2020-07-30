import React, { useState } from "react";

import styles from "./MyApplications.module.css";

const MyApplications = ({ storage }) => {
  const [address, setAddress] = useState("");
  const renderJobs = storage
    .filter((job) =>
      job.args[1].args[0].args[0].args[0].some(
        (application) => application.args[0].string === address
      )
    )
    .map((job) => (
      <div className={styles.job_card}>
        <h4>Job ID : {job.args[0].string}</h4>
        <p>Company : {job.args[1].args[0].args[0].args[1].string}</p>
        <p>Contact : {job.args[1].args[0].args[1].args[0].string}</p>
        <p>
          Link to Job Description : {job.args[1].args[0].args[1].args[1].string}
        </p>
        <p>Owner Address : {job.args[1].args[1].args[0].args[0].string}</p>
        <p>
          Status :{" "}
          {job.args[1].args[1].args[1].args[0].int == 0
            ? "Applied"
            : job.args[1].args[1].args[0].args[1].args[0].string == address
            ? "Accepted"
            : "Rejected"}
        </p>
        <p>Stipend : {job.args[1].args[1].args[1].args[1].int}mutez</p>
      </div>
    ));

  return (
    <div className={styles.body}>
      {/* <h5>Latest Operations Group ID : {latestId || "No transactions yet!"}</h5> */}
      <h5>Please enter your account address : </h5>
      <input
        type="text"
        placeholder="Enter Address"
        className={styles.input}
        onChange={({ target: { value } }) => setAddress(value)}
      />
      <div className={styles.cards_container}>{renderJobs}</div>
    </div>
  );
};

export default MyApplications;
