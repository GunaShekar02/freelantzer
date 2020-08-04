import React, { useEffect, useState } from "react";
import { TezosNodeReader } from "conseiljs";
import { ThanosWallet } from "@thanos-wallet/dapp";
import { Route, Switch, useHistory } from "react-router-dom";

import MyJobs from "./Containers/MyJobs/MyJobs";
import MyApplications from "./Containers/MyApplications/MyApplications";

import Modal from "./Components/Modal/Modal";

import styles from "./App.module.css";

var tezosNode = "https://carthagenet.smartpy.io",
  contractAddress = "KT1UgY1azx3rSTkgafWn6jHQo1VQ2C5Dau9Q";

let wallet = undefined,
  tezos = undefined,
  freelantzer = undefined;

const ListJobModal = ({ showListJobModal, setListJobModal, setLatestId }) => {
  const [jobDetails, setJobDetails] = useState({
    company: "",
    contact: "",
    jd: "",
    stipend: undefined,
    maxHires: undefined,
  });
  const [listLoading, setListLoading] = useState(false);

  const handleJobDetailsChange = ({ target: { name, value } }) => {
    setJobDetails({
      ...jobDetails,
      [name]: value,
    });
  };

  //List a job and transfer the stipend amount to the contract
  const listJob = async () => {
    setListLoading(true);

    const operation = await freelantzer.methods
      .list_job(
        jobDetails.company,
        jobDetails.contact,
        jobDetails.jd,
        `${jobDetails.company
          .split("")
          .slice(0, 3)
          .join("")
          .toUpperCase()}${Math.floor(Date.now() / 1000)}`,
        jobDetails.maxHires
      )
      .send({ amount: jobDetails.stipend * jobDetails.maxHires, mutez: true });

    await operation.confirmation();
    setListLoading(false);
    setLatestId(operation.opHash);
    setListJobModal(false);
  };

  return (
    <Modal show={showListJobModal} setShow={setListJobModal}>
      <div className={styles.modal_container}>
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
  const [resume, setResume] = useState("");
  const [applyLoading, setApplyLoading] = useState(false);

  //Apply for a particular job
  const apply = async () => {
    if (!jobId) return;

    setApplyLoading(true);
    const operation = await freelantzer.methods
      .apply_for_job(jobId, resume)
      .send();

    await operation.confirmation();

    setApplyLoading(false);
    setLatestId(operation.opHash);
    setApplyModal(false);
  };

  return (
    <Modal show={showApplyModal} setShow={setApplyModal}>
      <div className={styles.modal_container}>
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
  const [latestId, setLatestId] = useState("");

  const [showListJobModal, setListJobModal] = useState(false);
  const [showApplyModal, setApplyModal] = useState(false);
  const [jobToApply, setJobToApply] = useState();

  const history = useHistory();

  const checkWalletConfigurable = async () => {
    try {
      await ThanosWallet.isAvailable();
      wallet = new ThanosWallet("FreelanTZer");
      console.log(wallet);
      await wallet.connect("carthagenet");
      tezos = wallet.toTezos();
      console.log(await tezos.wallet.pkh());
      freelantzer = await tezos.wallet.at(
        "KT1UgY1azx3rSTkgafWn6jHQo1VQ2C5Dau9Q"
      );
      console.log(freelantzer);
    } catch (e) {
      console.log(e, "Error");
    }
  };

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
    checkWalletConfigurable();
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
        <p>Number of openings: {job.args[1].args[1].args[0].args[0].int}</p>
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
              List
            </button>
            <hr />
            <h2>Job listings</h2>
            <div className={styles.cards_container}>{renderListings}</div>
          </div>
        </Route>
        <Route exact path="/myjobs">
          <MyJobs storage={storage} tezos={tezos} freelantzer={freelantzer} />
        </Route>
        <Route exact path="/myapplications">
          <MyApplications
            storage={storage}
            tezos={tezos}
            freelantzer={freelantzer}
          />
        </Route>
      </Switch>
    </>
  );
};

export default App;
