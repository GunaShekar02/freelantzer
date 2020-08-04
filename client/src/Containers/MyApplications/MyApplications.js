import React, { useState, useEffect } from "react";
import { ThanosWallet } from "@thanos-wallet/dapp";

import styles from "./MyApplications.module.css";

let wallet = undefined,
  tezos = undefined,
  freelantzer = undefined;

const MyApplications = ({ storage }) => {
  const [address, setAddress] = useState("");

  const checkWalletConfigurable = async () => {
    try {
      await ThanosWallet.isAvailable();
      wallet = new ThanosWallet("FreelanTZer");
      console.log(wallet);
      await wallet.connect("carthagenet");
      tezos = wallet.toTezos();
      setAddress(await tezos.wallet.pkh());
      freelantzer = await tezos.wallet.at(
        "KT1UgY1azx3rSTkgafWn6jHQo1VQ2C5Dau9Q"
      );
      console.log(freelantzer);
    } catch (e) {
      console.log(e, "Error");
    }
  };

  useEffect(() => {
    checkWalletConfigurable();
  }, []);

  const renderJobs = storage
    .filter(
      (job) =>
        job.args[1].args[0].args[0].args[0].some(
          (application) => application.args[0].string === address
        ) ||
        job.args[1].args[1].args[1].args[0].some(
          (selected) => selected.args[0].string === address
        )
    )
    .map((job) => (
      <div className={styles.job_card}>
        <h4>Job ID : {job.args[0].string}</h4>
        <p>Company : {job.args[1].args[0].args[0].args[1].string}</p>
        <p>Contact : {job.args[1].args[0].args[1].args[0].string}</p>
        <p>
          Link to Job Description :{" "}
          {job.args[1].args[0].args[1].args[1].args[1].string}
        </p>
        <p>Owner Address : {job.args[1].args[1].args[0].args[1].string}</p>
        <p>
          Status :{" "}
          {job.args[1].args[0].args[0].args[0].some(
            (application) => application.args[0].string === address
          )
            ? job.args[1].args[1].args[1].args[1].args[0].int == 1
              ? "Rejected"
              : "Applied"
            : "Accepted"}
        </p>
        <p>Stipend : {job.args[1].args[1].args[1].args[1].args[1].int}mutez</p>
      </div>
    ));

  return (
    <div className={styles.body}>
      {/* <h5>Latest Operations Group ID : {latestId || "No transactions yet!"}</h5> */}
      <h5>Your account address : {address}</h5>
      <div className={styles.cards_container}>{renderJobs}</div>
    </div>
  );
};

export default MyApplications;
