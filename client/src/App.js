import React, { useEffect, useState } from "react";
import {
  TezosNodeWriter,
  TezosParameterFormat,
  TezosNodeReader,
} from "conseiljs";

import styles from "./App.module.css";

var key_name = "test_key1";
var applier = "test_key2";
var key = require(`../../keystore/${key_name}`);
var applierKey = require(`../../keystore/${applier}`);

var tezosNode = "https://carthagenet.smartpy.io",
  contractAddress = "KT1QwZc1vGhVKMNDo8nNb8mqJ83eRWRaCz7A";

const App = () => {
  const [storage, setStorage] = useState([]);
  const [jobId, setJobId] = useState("");
  const [candidate, setCandidate] = useState("");
  const [listLoading, setListLoading] = useState(false);
  const [applyLoading, setApplyLoading] = useState(false);
  const [hireLoading, setHireLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [latestId, setLatestId] = useState("");

  useEffect(() => {
    if (latestId)
      alert(
        `Operation Group ID : ${latestId}\n
        Please wait for around a minute for the changes to go through the network and then refresh to see the changes.\n
        You can copy this ID from the top of the page to explore further.`
      );
  }, [latestId]);

  const transferStipend = async (_job_id) => {
    if (!_job_id) return;

    var keystore = key,
      amount = 0,
      fee = 100000,
      storage_limit = 1000,
      gas_limit = 200000,
      entry_point = undefined,
      parameters = `(Right (Right "${_job_id}"))`,
      derivation_path = "";

    setSubmitLoading(true);
    const result = await TezosNodeWriter.sendContractInvocationOperation(
      tezosNode,
      keystore,
      contractAddress,
      amount,
      fee,
      derivation_path,
      storage_limit,
      gas_limit,
      entry_point,
      parameters,
      TezosParameterFormat.Michelson
    );
    setSubmitLoading(false);
    setLatestId(result.operationGroupID);
  };

  const hire = async (_job_id) => {
    if (!_job_id || !candidate) return;

    var keystore = key,
      amount = 0,
      fee = 100000,
      storage_limit = 1000,
      gas_limit = 200000,
      entry_point = undefined,
      parameters = `(Left (Right (Pair "${candidate}" "${_job_id}")))`,
      derivation_path = "";

    setHireLoading(true);
    const result = await TezosNodeWriter.sendContractInvocationOperation(
      tezosNode,
      keystore,
      contractAddress,
      amount,
      fee,
      derivation_path,
      storage_limit,
      gas_limit,
      entry_point,
      parameters,
      TezosParameterFormat.Michelson
    );
    setHireLoading(false);
    setLatestId(result.operationGroupID);
  };

  const apply = async () => {
    if (!jobId) return;

    var keystore = applierKey,
      amount = 0,
      fee = 100000,
      storage_limit = 1000,
      gas_limit = 200000,
      entry_point = undefined,
      parameters = `(Left (Left (Pair "${jobId}" "Link to resume")))`,
      derivation_path = "";

    setApplyLoading(true);
    const result = await TezosNodeWriter.sendContractInvocationOperation(
      tezosNode,
      keystore,
      contractAddress,
      amount,
      fee,
      derivation_path,
      storage_limit,
      gas_limit,
      entry_point,
      parameters,
      TezosParameterFormat.Michelson
    );
    setApplyLoading(false);
    setLatestId(result.operationGroupID);
  };

  const listJob = async () => {
    var keystore = key,
      amount = 100,
      fee = 100000,
      storage_limit = 1000,
      gas_limit = 200000,
      entry_point = undefined,
      parameters = `(Right (Left (Pair (Pair "Tezos" "+91-9999999999") (Pair "link to jd" "Te${Math.floor(
        Date.now() / 1000
      )}"))))`,
      derivation_path = "";
    setListLoading(true);
    const result = await TezosNodeWriter.sendContractInvocationOperation(
      tezosNode,
      keystore,
      contractAddress,
      amount,
      fee,
      derivation_path,
      storage_limit,
      gas_limit,
      entry_point,
      parameters,
      TezosParameterFormat.Michelson
    );
    setListLoading(false);
    setLatestId(result?.operationGroupID);
  };

  const getStorage = async () => {
    const storage = await TezosNodeReader.getContractStorage(
      tezosNode,
      contractAddress
    );
    setStorage(storage);
  };

  useEffect(() => {
    console.log(key);
    getStorage();
  }, []);

  const renderListings = storage.map((job) => (
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
        {job.args[1].args[1].args[1].args[0].int == 0 ? "Open" : "Closed"}
      </p>
      <p>Stipend : {job.args[1].args[1].args[1].args[1].int}mutez</p>

      {job.args[1].args[1].args[1].args[0].int == 1 ? (
        <>
          <h5>
            Selected Candidate :{" "}
            {job.args[1].args[1].args[0].args[1].args[0].string}
          </h5>
          <button
            onClick={() => transferStipend(job.args[0].string)}
            className={styles.button}
          >
            {submitLoading ? "Loading..." : "Transfer Stipend"}
          </button>
        </>
      ) : (
        <>
          <h4>Applications : </h4>
          {job.args[1].args[0].args[0].args[0].map((application) => (
            <>
              <p>Account : {application.args[0].string}</p>
              <p>Resume : {application.args[1].string}</p>
            </>
          ))}
          <h4>Hire Candidate : </h4>
          <input
            className={styles.input}
            type="text"
            placeholder="Enter Account Address"
            onChange={(e) => setCandidate(e.target.value)}
          />
          <button
            onClick={() => hire(job.args[0].string)}
            className={styles.button}
          >
            {hireLoading ? "Loading..." : "Hire"}
          </button>
        </>
      )}

      <hr />
    </div>
  ));
  return (
    <>
      <div className={styles.header}>
        <h1>FreelanTZer</h1>
      </div>
      <div className={styles.body}>
        <h5>
          Latest Operations Group ID : {latestId || "No transactions yet!"}
        </h5>
        <h5>
          (Please wait for a few seconds and refresh to view the changes after
          making a transaction)
        </h5>
        <hr />
        <h2>List a new job</h2>
        <button onClick={listJob} className={styles.button}>
          {listLoading ? "Loading..." : "List"}
        </button>
        <hr />
        <h2>Apply for a job</h2>
        <input
          className={styles.input}
          placeholder="Enter Job ID"
          type="text"
          onChange={(e) => setJobId(e.target.value)}
        />
        <button onClick={apply} className={styles.button}>
          {applyLoading ? "Loading..." : "Apply"}
        </button>
        <hr />
        <h2>Job listings</h2>
        <div className={styles.cards_container}>{renderListings}</div>
      </div>
    </>
  );
};

export default App;
