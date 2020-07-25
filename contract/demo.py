import smartpy as sp


class Freelantzer(sp.Contract):
    # A job goes through 3 stages:
    # 0. Listed and open for applications.
    # 1. An applicant has been hired and applications are closed.
    # 2. The work is done and stipend has been transferred.

    # The only state to be maintained is the jobs map. It maps a Job ID to its details.
    # The value is a record containing owner of the job, company name, link to job description, stipend amount for the job, contact number/email, status of the job(0,1,2), a map of applications, address of selected candidate.
    # Applicants is a map with key as address of the applicant and value as their resume. It's a map and not a list in order to facilitate O(1) lookups for applications.
    def __init__(self):
        self.init(jobs=sp.big_map(tkey=sp.TString, tvalue=sp.TRecord(owner=sp.TAddress, company=sp.TString, job_description=sp.TString,
                                                                     stipend=sp.TMutez, contact=sp.TString, status=sp.TInt, applications=sp.TMap(sp.TAddress, sp.TString), selected=sp.TOption(sp.TAddress))))

    # An _ has been used in front of private variables as per convention.
    @sp.entry_point
    def list_job(self, _job_id, _company, _job_description, _contact):
        # Cannot post another job with the same ID
        sp.verify(~self.data.jobs.contains(_job_id))
        self.data.jobs[_job_id] = sp.record(owner=sp.source, company=_company, job_description=_job_description,
                                            stipend=sp.amount, contact=_contact, status=0, applications={}, selected=sp.none)

    @sp.entry_point
    def apply_for_job(self, _job_id, _resume):
        self.data.jobs[_job_id].applications[sp.source] = _resume

    @sp.entry_point
    def hire(self, _job_id, _candidate):
        # Should be a valid job
        sp.verify(self.data.jobs.contains(_job_id))
        # Only owner should be allowed to hire
        sp.verify(sp.source == self.data.jobs[_job_id].owner)
        # Status of the contract should be 0
        sp.verify(self.data.jobs[_job_id].status == 0)
        # Only 1 person is allowed to be hired, so check if there already exists some other hire
        sp.verify(~self.data.jobs[_job_id].selected.is_some())
        self.data.jobs[_job_id].selected = sp.some(_candidate)
        self.data.jobs[_job_id].status = 1

    @sp.entry_point
    def submit(self, _job_id):
        # Should be a valid job
        sp.verify(self.data.jobs.contains(_job_id))
        # Status 1 indicates that a candidate has been selected, so the status should be 1
        sp.verify(self.data.jobs[_job_id].status == 1)
        sp.send(self.data.jobs[_job_id].selected.open_some(),
                self.data.jobs[_job_id].stipend)
        del self.data.jobs[_job_id]

# Tests
@sp.add_test(name="FreelantzerTest")
def test():
    # We define a test scenario, together with some outputs and checks
    scenario = sp.test_scenario()
    scenario.h1("FreelantzerTest")

    # We first define a contract and add it to the scenario
    c1 = Freelantzer()
    scenario += c1

    lister = sp.test_account("Lister")
    applier = sp.test_account("Applier")

    scenario += c1.list_job(_job_id="1", _company="Company Name", _job_description="link",
                            _contact="+91-9999999999").run(source=lister, amount=sp.mutez(1000))
    scenario += c1.list_job(_job_id="1", _company="Company Name", _job_description="link",
                            _contact="+91-9999999999").run(source=lister, amount=sp.mutez(1000), valid=False)

    scenario += c1.apply_for_job(_job_id="1",
                                 _resume="resume link").run(source=applier)
    scenario += c1.apply_for_job(_job_id="1",
                                 _resume="resume link").run(source=applier)

    scenario += c1.hire(_job_id="1",
                        _candidate=applier.address).run(source=lister)

    scenario.verify(c1.balance == sp.mutez(1000))
    scenario += c1.submit("1")
    scenario.verify(c1.balance == sp.mutez(0))
