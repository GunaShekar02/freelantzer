import React, { useState, useEffect } from "react";
import {
  TezosNodeWriter,
  TezosParameterFormat,
  TezosNodeReader,
  StoreType,
} from "conseiljs";

import Modal from "../../Components/Modal/Modal";

import styles from "./MyJobs.module.css";

var tezosNode = "https://carthagenet.smartpy.io",
  contractAddress = "KT1UgY1azx3rSTkgafWn6jHQo1VQ2C5Dau9Q";

const HireModal = ({
  showHireModal,
  setHireModal,
  setLatestId,
  jobId,
  candidate,
}) => {
  const [keystore, setKeystore] = useState({
    publicKey: "",
    privateKey: "",
    publicKeyHash: "",
    seed: "",
    storeType: StoreType.Fundraiser,
  });
  const [offerLetter, setOfferLetter] = useState("");
  const [hireLoading, setHireLoading] = useState(false);

  const handleKeystoreChange = ({ target: { name, value } }) => {
    setKeystore({
      ...keystore,
      [name]: value,
    });
  };

  //Hire a particular candidate for a particular job.
  const hire = async () => {
    if (!jobId || !candidate) return;

    var amount = 0,
      fee = 100000,
      storage_limit = 1000,
      gas_limit = 200000,
      entry_point = undefined,
      parameters = `(Left (Right (Pair "${candidate}" (Pair "${jobId}" "${offerLetter}"))))`,
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
    setHireModal(false);
  };

  return (
    <Modal show={showHireModal} setShow={setHireModal}>
      <div className={styles.modal_container}>
        <p>You're about to hire : {candidate}</p>
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
          placeholder="Offer Letter Link"
          name="oferrLetter"
          value={offerLetter}
          onChange={({ target: { value } }) => setOfferLetter(value)}
        />
        <button className={styles.button} onClick={hire}>
          {hireLoading ? "Loading..." : "Hire"}
        </button>
      </div>
    </Modal>
  );
};

const TransferModal = ({
  showTransferModal,
  setTransferModal,
  setLatestId,
  jobId,
  candidate,
}) => {
  const [keystore, setKeystore] = useState({
    publicKey: "",
    privateKey: "",
    publicKeyHash: "",
    seed: "",
    storeType: StoreType.Fundraiser,
  });
  const [transferLoading, setTransferLoading] = useState(false);

  const handleKeystoreChange = ({ target: { name, value } }) => {
    setKeystore({
      ...keystore,
      [name]: value,
    });
  };

  //The final step in the process is to transfer the stipend amount from the contract to the selected candidate.
  const transferStipend = async () => {
    if (!jobId) return;

    var amount = 0,
      fee = 100000,
      storage_limit = 1000,
      gas_limit = 200000,
      entry_point = undefined,
      parameters = `(Right (Right (Pair "${candidate}" "${jobId}")))`,
      derivation_path = "";

    setTransferLoading(true);
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
    setTransferLoading(false);
    setLatestId(result.operationGroupID);
    setTransferModal(false);
  };

  return (
    <Modal show={showTransferModal} setShow={setTransferModal}>
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
        <button className={styles.button} onClick={transferStipend}>
          {transferLoading ? "Loading..." : "Transfer Stipend"}
        </button>
      </div>
    </Modal>
  );
};

const MyJobs = ({ storage }) => {
  const [address, setAddress] = useState("");
  const [showHireModal, setHireModal] = useState(false);
  const [latestId, setLatestId] = useState();
  const [details, setDetails] = useState({
    jobId: "",
    candidate: "",
  });
  const [showTransferModal, setTransferModal] = useState(false);
  const [transferJobDetails, setTransferJobDetails] = useState({
    jobId: "",
    candidate: "",
  });

  useEffect(() => {
    if (latestId)
      alert(
        `Operation Group ID : ${latestId}\n
        Please wait for around a minute for the changes to go through the network and then refresh to see the changes.\n
        You can copy this ID from the top of the page to explore further.`
      );
  }, [latestId]);

  const renderListings = storage
    .filter((job) => job.args[1].args[1].args[0].args[1].string == address)
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
        <>
          <h5>Selected Candidates : </h5>
          {job.args[1].args[1].args[1].args[0].map((selected) => (
            <>
              <p>Account : {selected.args[0].string}</p>
              <p>Resume : {selected.args[1].string}</p>
              <button
                onClick={() => {
                  setTransferJobDetails({
                    jobId: job.args[0].string,
                    candidate: selected.args[0].string,
                  });
                  setTransferModal(true);
                }}
                className={styles.button}
              >
                Transfer Stipend
              </button>
              <hr />
            </>
          ))}
        </>
        <>
          <h4>Applications : </h4>
          {job.args[1].args[0].args[0].args[0].map((application) => (
            <>
              <p>Account : {application.args[0].string}</p>
              <p>Resume : {application.args[1].string}</p>
              <button
                className={styles.button}
                onClick={() => {
                  setDetails({
                    jobId: job.args[0].string,
                    candidate: application.args[0].string,
                  });
                  setHireModal(true);
                }}
              >
                Hire
              </button>
              <hr />
            </>
          ))}
        </>
      </div>
    ));

  return (
    <>
      <HireModal
        showHireModal={showHireModal}
        setHireModal={setHireModal}
        setLatestId={setLatestId}
        jobId={details.jobId}
        candidate={details.candidate}
      />
      <TransferModal
        showTransferModal={showTransferModal}
        setTransferModal={setTransferModal}
        setLatestId={setLatestId}
        jobId={transferJobDetails.jobId}
        candidate={transferJobDetails.candidate}
      />
      <div className={styles.body}>
        <h5>
          Latest Operations Group ID : {latestId || "No transactions yet!"}
        </h5>
        <h5>Please enter your account address : </h5>
        <input
          type="text"
          placeholder="Enter Address"
          className={styles.input}
          onChange={({ target: { value } }) => setAddress(value)}
        />
        <div className={styles.cards_container}>{renderListings}</div>
      </div>
    </>
  );
};

export default MyJobs;
