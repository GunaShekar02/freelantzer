import React, { useEffect, useState } from "react";
import {
  TezosNodeWriter,
  TezosParameterFormat,
  TezosNodeReader,
  StoreType,
} from "conseiljs";

import Modal from "./Components/Modal/Modal";

import styles from "./App.module.css";

var key_name = "test_key1";
var applier = "test_key2";

//key is going to be used for listing jobs and applierKey is going to be used for applying for jobs.
var key = require(`../../keystore/${key_name}`);
var applierKey = require(`../../keystore/${applier}`);

var tezosNode = "https://carthagenet.smartpy.io",
  contractAddress = "KT1A8cTdb9a81RdQdbEBAv3EjoutQtVVscY5";

const ListJobModal = ({ showListJobModal, setListJobModal, setLatestId }) => {
  const [keystore, setKeystore] = useState({
    publicKey: "",
    privateKey: "",
    publicKeyHash: "",
    seed: "",
    storeType: StoreType.Fundraiser,
  });
  const [jobDetails, setJobDetails] = useState({
    company: "",
    contact: "",
    jd: "",
    stipend: undefined,
  });
  const [listLoading, setListLoading] = useState(false);

  const handleKeystoreChange = ({ target: { name, value } }) => {
    setKeystore({
      ...keystore,
      [name]: value,
    });
  };

  const handleJobDetailsChange = ({ target: { name, value } }) => {
    setJobDetails({
      ...jobDetails,
      [name]: value,
    });
  };

  //List a job and transfer the stipend amount to the contract
  const listJob = async () => {
    var amount = jobDetails.stipend,
      fee = 100000,
      storage_limit = 1000,
      gas_limit = 200000,
      entry_point = undefined,
      parameters = `(Right (Left (Pair (Pair "${jobDetails.company}" "${
        jobDetails.contact
      }") (Pair "${jobDetails.jd}" "${jobDetails.company
        .slice(0, 3)
        .toUpperCase()}${Math.floor(Date.now() / 1000)}"))))`,
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
    setListJobModal(false);
  };

  return (
    <Modal show={showListJobModal} setShow={setListJobModal}>
      <div className={styles.modal_container}>
        <input
          type="text"
          placeholder="Public Key"
          name="publicKey"
          value={keystore.publicKey}
          onChange={handleKeystoreChange}
        />
        <input
          type="text"
          placeholder="Private Key"
          name="privateKey"
          value={keystore.privateKey}
          onChange={handleKeystoreChange}
        />
        <input
          type="text"
          placeholder="Public Key Hash(Address)"
          name="publicKeyHash"
          value={keystore.publicKeyHash}
          onChange={handleKeystoreChange}
        />
        <input
          type="text"
          placeholder="Company Name"
          name="company"
          value={jobDetails.company}
          onChange={handleJobDetailsChange}
        />
        <input
          type="text"
          placeholder="Contact"
          name="contact"
          value={jobDetails.contact}
          onChange={handleJobDetailsChange}
        />
        <input
          type="text"
          placeholder="Link to Job Description"
          name="jd"
          value={jobDetails.jd}
          onChange={handleJobDetailsChange}
        />
        <input
          type="text"
          placeholder="Stipend (in mutez)"
          name="stipend"
          value={jobDetails.stipend}
          onChange={handleJobDetailsChange}
        />
        <button className={styles.button} onClick={listJob}>
          {listLoading ? "Loading..." : "List"}
        </button>
      </div>
    </Modal>
  );
};

const App = () => {
  const [storage, setStorage] = useState([]);
  const [jobId, setJobId] = useState("");
  const [candidate, setCandidate] = useState("");
  const [listLoading, setListLoading] = useState(false);
  const [applyLoading, setApplyLoading] = useState(false);
  const [hireLoading, setHireLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [latestId, setLatestId] = useState("");

  const [showListJobModal, setListJobModal] = useState(false);

  //Show an alert with the Operation Group ID whenever a transaction takes place.
  useEffect(() => {
    if (latestId)
      alert(
        `Operation Group ID : ${latestId}\n
        Please wait for around a minute for the changes to go through the network and then refresh to see the changes.\n
        You can copy this ID from the top of the page to explore further.`
      );
  }, [latestId]);

  //The functions have been written in the reverse order of their chronological execution.

  //The final step in the process is to transfer the stipend amount from the contract to the selected candidate.
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

  //Hire a particular candidate for a particular job.
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

  //Apply for a particular job
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

  //Get the current contract storage
  const getStorage = async () => {
    const storage = await TezosNodeReader.getContractStorage(
      tezosNode,
      contractAddress
    );
    setStorage(storage);
  };

  //Fetch the storage everytime the component is mounted
  useEffect(() => {
    getStorage();
  }, []);

  //UI for Job Cards
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
      <ListJobModal
        showListJobModal={showListJobModal}
        setListJobModal={setListJobModal}
        setLatestId={setLatestId}
      />
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
        <button onClick={() => setListJobModal(true)} className={styles.button}>
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
