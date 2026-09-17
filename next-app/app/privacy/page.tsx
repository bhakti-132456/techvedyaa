import type { Metadata } from 'next';
import Link from 'next/link';
import { company, processors } from '@/lib/company';
import { analyticsEnabled, analytics } from '@/lib/analytics';
import { Val, ReviewNotice } from '@/components/legal/LegalUI';
import Footer from '@/components/sections/Footer';
import styles from '../legal.module.css';

export const metadata: Metadata = {
    title: 'Privacy Policy | TechVedyaa',
    description:
        'How TechVedyaa India Pvt Ltd collects, uses, stores and shares personal data submitted through this website, and the rights you have over it.',
    alternates: { canonical: '/privacy' },
    openGraph: {
        type: 'article',
        url: '/privacy',
        title: 'Privacy Policy | TechVedyaa',
    },
};

export default function PrivacyPolicy() {
    return (
        <>
            <main className={styles.page}>
                <div className="container">
                    <div className={styles.wrap}>
                        <p className={styles.eyebrow}>Legal</p>
                        <h1 className={styles.title}>Privacy Policy</h1>
                        <p className={styles.updated}>
                            Last updated: <Val value={company.policyLastUpdated} label="policy date" />
                        </p>

                        <ReviewNotice />

                        <section className={styles.section}>
                            <h2>Who we are</h2>
                            <p>
                                {company.legalName} (&ldquo;{company.shortName}&rdquo;, &ldquo;we&rdquo;,
                                &ldquo;us&rdquo;) operates this website. We are the data fiduciary
                                responsible for personal data collected through it.
                            </p>
                            <p>
                                Registered office:{' '}
                                <Val value={company.registeredAddress} label="registered address" />
                                <br />
                                CIN: <Val value={company.cin} label="CIN" />
                                <br />
                                Contact: <Val value={company.email} label="contact email" />
                            </p>
                        </section>

                        <section className={styles.section}>
                            <h2>What we collect</h2>
                            <p>
                                We only collect what you type into the enquiry form on this site.
                                There is no account system, no login, and no profile built about you.
                            </p>
                            <div className={styles.tableWrap}>
                                <table className={styles.table}>
                                    <tbody>
                                        <tr>
                                            <th scope="row">Name</th>
                                            <td>To address you correctly in our reply.</td>
                                        </tr>
                                        <tr>
                                            <th scope="row">Email address</th>
                                            <td>To respond to your enquiry.</td>
                                        </tr>
                                        <tr>
                                            <th scope="row">Phone number</th>
                                            <td>
                                                To respond by phone, and by WhatsApp only if you
                                                explicitly opt in on the form.
                                            </td>
                                        </tr>
                                        <tr>
                                            <th scope="row">Your requirements</th>
                                            <td>
                                                The free-text description of what you need. Please
                                                don&rsquo;t include sensitive personal or confidential
                                                information here.
                                            </td>
                                        </tr>
                                        <tr>
                                            <th scope="row">Consent record</th>
                                            <td>
                                                The wording you agreed to and the time you submitted,
                                                so we can demonstrate the basis on which we hold your
                                                data.
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            <p>
                                We do not collect special category or sensitive personal data, and we
                                do not knowingly collect data from children.
                            </p>
                        </section>

                        <section className={styles.section}>
                            <h2>Why we process it, and on what basis</h2>
                            <p>
                                We process the above solely to respond to your enquiry and to discuss
                                providing our services to you. Our basis is <strong>your consent</strong>,
                                given by ticking the consent box when you submit the form.
                            </p>
                            <p>
                                We do not sell personal data, we do not share it for advertising, and
                                we do not use it for automated decision-making or profiling.
                            </p>
                        </section>

                        <section className={styles.section}>
                            <h2>Who else sees it</h2>
                            <p>
                                Your submission passes through the following third parties, which act
                                on our behalf. Each has its own privacy terms, linked below.
                            </p>
                            <div className={styles.tableWrap}>
                                <table className={styles.table}>
                                    <thead>
                                        <tr>
                                            <th scope="col">Recipient</th>
                                            <th scope="col">Purpose</th>
                                            <th scope="col">Location</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {processors.map((p) => (
                                            <tr key={p.name}>
                                                <th scope="row">
                                                    <a
                                                        href={p.policy}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                    >
                                                        {p.name}
                                                    </a>
                                                </th>
                                                <td>{p.purpose}</td>
                                                <td>{p.location}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <p>
                                Because these providers operate globally, your data may be stored or
                                processed outside India. We may also disclose data where we are
                                legally required to.
                            </p>
                        </section>

                        <section className={styles.section}>
                            <h2>Cookies and analytics</h2>
                            {analyticsEnabled ? (
                                <p>
                                    We use <strong>{analytics.provider}</strong> to understand how this
                                    site is used. Where this requires cookies, they are set only after
                                    you agree via the consent banner, and you can decline without
                                    losing access to any part of the site.
                                </p>
                            ) : (
                                <p>
                                    <strong>
                                        This site currently sets no analytics or advertising cookies.
                                    </strong>{' '}
                                    We do not track you across sites and we run no third-party
                                    advertising or tracking scripts.
                                </p>
                            )}
                            <p>
                                We store one item locally in your browser: your light/dark theme
                                preference. This is strictly functional, never leaves your device, and
                                is not used to identify you.
                            </p>
                            <p>
                                If we introduce analytics in future, we will update this policy and,
                                where the tool requires consent, ask before anything is set.
                            </p>
                        </section>

                        <section className={styles.section}>
                            <h2>How long we keep it</h2>
                            <p>
                                Enquiry submissions are retained for{' '}
                                <strong>{company.leadRetention}</strong> from the date of submission,
                                after which they are deleted. If you become a client, related records
                                may be kept longer where required for contractual or statutory
                                reasons.
                            </p>
                            <p>
                                You can ask us to delete your data sooner at any time. See below.
                            </p>
                        </section>

                        <section className={styles.section}>
                            <h2>How we protect it</h2>
                            <p>
                                Submissions are transmitted over HTTPS and stored in access-controlled
                                systems limited to the people who need them to respond to you. We
                                review access periodically. No system is perfectly secure, but if a
                                breach affects your data we will notify you and the Data Protection
                                Board as required.
                            </p>
                        </section>

                        <section className={styles.section} id="your-rights">
                            <h2>Your rights</h2>
                            <p>
                                Under the Digital Personal Data Protection Act, 2023, you may ask us
                                to:
                            </p>
                            <ul>
                                <li>Confirm what personal data of yours we hold, and access it.</li>
                                <li>Correct or complete anything inaccurate.</li>
                                <li>Erase your data where we no longer need it.</li>
                                <li>
                                    Withdraw your consent, as easily as you gave it. We will stop
                                    processing and delete your data unless we must keep it by law.
                                </li>
                                <li>
                                    Nominate someone to exercise these rights on your behalf if you
                                    are unable to.
                                </li>
                            </ul>
                            <p>
                                To exercise any of these, email{' '}
                                <Val value={company.grievanceOfficer.email} label="grievance email" />.
                                We will respond within a reasonable period.
                            </p>
                        </section>

                        <section className={styles.section} id="grievance">
                            <h2>Complaints</h2>
                            <p>
                                If you are unhappy with how we have handled your data, contact our{' '}
                                {company.grievanceOfficer.title} first:
                            </p>
                            <p>
                                <Val value={company.grievanceOfficer.name} label="grievance officer" />
                                , {company.grievanceOfficer.title}
                                <br />
                                <Val value={company.grievanceOfficer.email} label="grievance email" />
                            </p>
                            <p>
                                If we do not resolve it to your satisfaction, you have the right to
                                complain to the Data Protection Board of India.
                            </p>
                        </section>

                        <section className={styles.section}>
                            <h2>Changes to this policy</h2>
                            <p>
                                We will update this page if our practices change, and revise the date
                                at the top. Material changes affecting how we use data you have
                                already given us will be notified directly where we can reach you.
                            </p>
                        </section>

                        <Link href="/" className={styles.backLink}>
                            <span aria-hidden="true">&larr;</span> Back to home
                        </Link>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
}
