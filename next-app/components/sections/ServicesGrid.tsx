import { services } from '@/lib/data/services';
import styles from './Services.module.css';

export default function ServicesGrid() {
    return (
        <section className={styles.servicesTrack} id="services">
            <div className={styles.sectionHeader}>
                <p className={styles.sectionLabel}>What We Do</p>
                <h2 className={styles.sectionTitle}>
                    Comprehensive <span className="gradient-text">Service Offerings</span>
                </h2>
                <p className={styles.sectionDescription}>
                    From marketing automation to AI-powered solutions, we provide end-to-end services that
                    transform your business.
                </p>
            </div>

            {/* 
        Desktop: LocomotionEngine pins this section and translates .horizontalWrapper via GSAP.
        Mobile: Native CSS scroll-snap takes over (See Services.module.css). 
      */}
            <div className={styles.horizontalWrapper} data-horizontal-track>
                {services.map((service) => (
                    <div key={service.id} className={styles.serviceCard}>
                        <div
                            className={styles.serviceIcon}
                            dangerouslySetInnerHTML={{ __html: service.icon }}
                        />
                        <h3 className={styles.serviceTitle}>{service.title}</h3>
                        <p className={styles.serviceDescription}>{service.description}</p>
                        <ul className={styles.serviceFeatures}>
                            {service.features.map((feature, i) => (
                                <li key={i}>{feature}</li>
                            ))}
                        </ul>
                        <a href="#contact" className={styles.serviceLink}>
                            Learn More →
                        </a>
                    </div>
                ))}
            </div>
        </section>
    );
}
