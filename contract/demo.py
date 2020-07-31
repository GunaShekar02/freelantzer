import smartpy as sp

# This is the SmartPy editor.
# You can experiment with SmartPy by loading a template.
# (in the Commands menu above this editor)
#
# A typical SmartPy program has the following form:

# A class of contracts


class Freelantzer(sp.Contract):
    # A job goes through 3 stages:
    # 0. Listed and open for applications.
    # 1. Required number of applicants have been hired and applications are closed.
    # 2. The work is done and stipend has been transferred.
    def __init__(self):
        self.init(jobs=sp.map(tkey=sp.TString, tvalue=sp.TRecord(owner=sp.TAddress, company=sp.TString, job_description=sp.TString, stipend=sp.TMutez, contact=sp.TString,
                                                                 status=sp.TInt, applications=sp.TMap(sp.TAddress, sp.TString), selected=sp.TMap(sp.TAddress, sp.TString), max_hires=sp.TInt, cur_hires=sp.TInt)))

    @sp.entry_point
    def list_job(self, _job_id, _company, _job_description, _contact, _max_hires):
        # Cannot post another job with the same ID
        sp.verify(~self.data.jobs.contains(_job_id))
        sp.verify(_max_hires > 0)
        sp.verify(sp.amount > sp.mutez(0))
        self.data.jobs[_job_id] = sp.record(owner=sp.source, company=_company, job_description=_job_description, stipend=sp.mutez(sp.fst(sp.ediv(
            sp.amount, sp.mutez(sp.as_nat(_max_hires))).open_some())), contact=_contact, status=0, applications={}, selected={}, max_hires=_max_hires, cur_hires=0)

    @sp.entry_point
    def apply_for_job(self, _job_id, _resume):
        self.data.jobs[_job_id].applications[sp.source] = _resume

    @sp.entry_point
    def hire(self, _job_id, _candidate, _offer_letter):
        # Should be a valid job
        sp.verify(self.data.jobs.contains(_job_id))
        # Only owner should be allowed to hire
        sp.verify(sp.source == self.data.jobs[_job_id].owner)
        # Status of the contract should be 0
        sp.verify(self.data.jobs[_job_id].status == 0)
        # Only max_hires persons are allowed to be hired, so check if the slots are already full
        sp.verify(self.data.jobs[_job_id].cur_hires <
                  self.data.jobs[_job_id].max_hires)
        self.data.jobs[_job_id].selected[_candidate] = _offer_letter
        self.data.jobs[_job_id].cur_hires += 1
        sp.if self.data.jobs[_job_id].cur_hires == self.data.jobs[_job_id].max_hires:
            self.data.jobs[_job_id].status = 1

    @sp.entry_point
    def submit(self, _job_id, _candidate):
        sp.verify(self.data.jobs.contains(_job_id))
        sp.verify(self.data.jobs[_job_id].owner == sp.source)
        sp.verify(self.data.jobs[_job_id].selected.contains(_candidate))
        sp.send(_candidate, self.data.jobs[_job_id].stipend)
        del self.data.jobs[_job_id].selected[_candidate]
        sp.if sp.len(self.data.jobs[_job_id].selected) == 0:
            del self.data.jobs[_job_id]

# Tests
@sp.add_test(name="FreelantzerTest")
def test():
    # We define a test scenario, together with some outputs and checks
    scenario = sp.test_scenario()
    scenario.h1("Freelantzer Test")

    # We first define a contract and add it to the scenario
    c1 = Freelantzer()
    scenario += c1

    lister = sp.test_account("Lister")
    applier = sp.test_account("Applier")
    applier2 = sp.test_account("Applier2")
    applier3 = sp.test_account("Applier3")

    scenario += c1.list_job(_job_id="1", _company="Company Name", _job_description="link",
                            _contact="+91-9999999999", _max_hires=1).run(source=lister, amount=sp.mutez(1000))
    scenario += c1.list_job(_job_id="1", _company="Company Name", _job_description="link",
                            _contact="+91-9999999999", _max_hires=1).run(source=lister, amount=sp.mutez(1000), valid=False)

    scenario += c1.apply_for_job(_job_id="1",
                                 _resume="resume link").run(source=applier)
    scenario += c1.apply_for_job(_job_id="1",
                                 _resume="resume link").run(source=applier)

    scenario += c1.hire(_job_id="1", _candidate=applier.address,
                        _offer_letter="letter").run(source=lister)

    scenario.verify(c1.balance == sp.mutez(1000))
    scenario += c1.submit(_job_id="1",
                          _candidate=applier.address).run(source=applier, valid=False)
    scenario += c1.submit(_job_id="1",
                          _candidate=applier.address).run(source=lister)
    scenario.verify(c1.balance == sp.mutez(0))

    scenario += c1.list_job(_job_id="1", _company="Company Name", _job_description="link",
                            _contact="+91-9999999999", _max_hires=2).run(source=lister, amount=sp.mutez(1000))
    scenario += c1.apply_for_job(_job_id="1",
                                 _resume="resume link").run(source=applier)
    scenario += c1.apply_for_job(_job_id="1",
                                 _resume="resume link").run(source=applier2)
    scenario += c1.apply_for_job(_job_id="1",
                                 _resume="resume link").run(source=applier3)

    scenario += c1.hire(_job_id="1", _candidate=applier.address,
                        _offer_letter="letter").run(source=lister)
    scenario += c1.hire(_job_id="1", _candidate=applier2.address,
                        _offer_letter="letter").run(source=lister)
    scenario += c1.hire(_job_id="1", _candidate=applier3.address,
                        _offer_letter="letter").run(source=lister, valid=False)

    scenario += c1.submit(_job_id="1",
                          _candidate=applier.address).run(source=lister)
    scenario += c1.submit(_job_id="1",
                          _candidate=applier3.address).run(source=lister, valid=False)
    scenario.verify(c1.balance == sp.mutez(500))

    scenario += c1.submit(_job_id="1",
                          _candidate=applier2.address).run(source=lister)

    scenario.verify(c1.balance == sp.mutez(0))
