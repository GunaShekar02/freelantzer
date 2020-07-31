import React, { useEffect, useState } from "react";
import {
  TezosNodeWriter,
  TezosParameterFormat,
  TezosNodeReader,
  StoreType,
} from "conseiljs";
import { Route, Switch, useHistory } from "react-router-dom";

import MyJobs from "./Containers/MyJobs/MyJobs";
import MyApplications from "./Containers/MyApplications/MyApplications";

import Modal from "./Components/Modal/Modal";

import styles from "./App.module.css";

var key_name = "test_key1";
var applier = "test_key2";

//key is going to be used for listing jobs and applierKey is going to be used for applying for jobs.
var key = require(`../../keystore/${key_name}`);
var applierKey = require(`../../keystore/${applier}`);

var tezosNode = "https://carthagenet.smartpy.io",
  contractAddress = "KT1UgY1azx3rSTkgafWn6jHQo1VQ2C5Dau9Q";

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
    maxHires: undefined,
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
    var amount = jobDetails.stipend * jobDetails.maxHires,
      fee = 100000,
      storage_limit = 1000,
      gas_limit = 200000,
      entry_point = undefined,
      parameters = `(Right (Left (Pair (Pair "${jobDetails.company}" "${
        jobDetails.contact
      }") (Pair "${jobDetails.jd}" (Pair "${jobDetails.company
        .split("")
        .slice(0, 3)
        .join("")
        .toUpperCase()}${Math.floor(Date.now() / 1000)}" ${parseInt(
        jobDetails.maxHires,
        10
      )})))))`,
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
          placeholder="Stipend per hire (in mutez)"
          name="stipend"
          value={jobDetails.stipend}
          onChange={handleJobDetailsChange}
        />
        <input
          type="text"
          placeholder="Max number of hires"
          name="maxHires"
          value={jobDetails.maxHires}
          onChange={handleJobDetailsChange}
        />
        <button className={styles.button} onClick={listJob}>
          {listLoading ? "Loading..." : "List"}
        </button>
      </div>
    </Modal>
  );
};

const ApplyModal = ({ showApplyModal, setApplyModal, setLatestId, jobId }) => {
  const [keystore, setKeystore] = useState({
    publicKey: "",
    privateKey: "",
    publicKeyHash: "",
    seed: "",
    storeType: StoreType.Fundraiser,
  });
  const [resume, setResume] = useState("");
  const [applyLoading, setApplyLoading] = useState(false);

  const handleKeystoreChange = ({ target: { name, value } }) => {
    setKeystore({
      ...keystore,
      [name]: value,
    });
  };

  //Apply for a particular job
  const apply = async () => {
    if (!jobId) return;

    var amount = 0,
      fee = 100000,
      storage_limit = 1000,
      gas_limit = 200000,
      entry_point = undefined,
      parameters = `(Left (Left (Pair "${jobId}" "${resume}")))`,
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
    setApplyModal(false);
  };

  return (
    <Modal show={showApplyModal} setShow={setApplyModal}>
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
          placeholder="Link to Resume"
          name="resume"
          value={resume}
          onChange={({ target: { value } }) => setResume(value)}
        />
        <button className={styles.button} onClick={apply}>
          {applyLoading ? "Loading..." : "Apply"}
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
  const [hireLoading, setHireLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [latestId, setLatestId] = useState("");

  const [showListJobModal, setListJobModal] = useState(false);
  const [showApplyModal, setApplyModal] = useState(false);
  const [jobToApply, setJobToApply] = useState();

  const history = useHistory();

  //Show an alert with the Operation Group ID whenever a transaction takes place.
  useEffect(() => {
    if (latestId)
      alert(
        `Operation Group ID : ${latestId}\n
        Please wait for around a minute for the changes to go through the network and then refresh to see the changes.\n
        You can copy this ID from the top of the page to explore further.`
      );
  }, [latestId]);

  //Get the current contract storage
  const getStorage = async () => {
    const storage = await TezosNodeReader.getContractStorage(
      tezosNode,
      contractAddress
    );
    setStorage(storage);
    console.log(JSON.stringify(storage));
    // const job = storage[0];
    // console.log("ID : ", job.args[0].string);
    // console.log("Applications : ", job.args[1].args[0].args[0].args[0]);
    // console.log("Company : ", job.args[1].args[0].args[0].args[1].string);
    // console.log("Contact : ", job.args[1].args[0].args[1].args[0].string);
    // console.log(
    //   "Cur hires : ",
    //   job.args[1].args[0].args[1].args[1].args[0].int
    // );
    // console.log(
    //   "Job Description : ",
    //   job.args[1].args[0].args[1].args[1].args[1].string
    // );
    // console.log("Max Hires : ", job.args[1].args[1].args[0].args[0].int);
    // console.log("Owner : ", job.args[1].args[1].args[0].args[1].string);
    // console.log("Selected : ", job.args[1].args[1].args[1].args[0]);
    // console.log("Status : ", job.args[1].args[1].args[1].args[1].args[0].int);
    // console.log("Stipend : ", job.args[1].args[1].args[1].args[1].args[1].int);
  };

  //Fetch the storage everytime the component is mounted
  useEffect(() => {
    getStorage();
  }, []);

  //UI for Job Cards
  const renderListings = storage
    .filter((job) => job.args[1].args[1].args[1].args[1].args[0].int == 0)
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
          {job.args[1].args[1].args[1].args[1].args[0].int == 0
            ? "Open"
            : "Closed"}
        </p>
        <p>Stipend : {job.args[1].args[1].args[1].args[1].args[1].int}mutez</p>
        <button
          className={styles.button}
          onClick={() => {
            setJobToApply(job.args[0].string);
            setApplyModal(true);
          }}
        >
          Apply
        </button>
      </div>
    ));

  return (
    <>
      <div className={styles.header}>
        <div>
          <h1 onClick={() => history.push("/")} className={styles.brand}>
            FreelanTZer
          </h1>
        </div>
        <div className={styles.nav}>
          <h3 onClick={() => history.push("/myjobs")}>My Job Listings</h3>
          <h3 onClick={() => history.push("/myapplications")}>
            My Applications
          </h3>
        </div>
      </div>
      <Switch>
        <Route exact path="/">
          <ListJobModal
            showListJobModal={showListJobModal}
            setListJobModal={setListJobModal}
            setLatestId={setLatestId}
          />
          <ApplyModal
            showApplyModal={showApplyModal}
            setApplyModal={setApplyModal}
            setLatestId={setLatestId}
            jobId={jobToApply}
          />

          <div className={styles.body}>
            <h5>
              Latest Operations Group ID : {latestId || "No transactions yet!"}
            </h5>
            <h5>
              (Please wait for a few seconds and refresh to view the changes
              after making a transaction)
            </h5>
            <hr />
            <h2>List a new job</h2>
            <button
              onClick={() => setListJobModal(true)}
              className={styles.button}
            >
              {listLoading ? "Loading..." : "List"}
            </button>
            <hr />
            <h2>Job listings</h2>
            <div className={styles.cards_container}>{renderListings}</div>
          </div>
        </Route>
        <Route exact path="/myjobs">
          <MyJobs storage={storage} />
        </Route>
        <Route exact path="/myapplications">
          <MyApplications storage={storage} />
        </Route>
      </Switch>
    </>
  );
};

export default App;
