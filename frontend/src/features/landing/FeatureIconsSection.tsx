import React from 'react'
import {FEATURE_GROUPS} from './featureIconsData'

const FeatureIconsSection: React.FC = () => {
    return (
        <section
            className="features-section card card--with-margin"
            aria-labelledby="features-heading"
        >
            <h2 id="features-heading" className="card-title">
                Почему «Силант»
            </h2>

            <p className="features-section__intro">
                Завод выпускает технику, которая учитывает реальные условия эксплуатации —
                от холодных складов до тяжёлых производственных цехов. Ниже — кратко о том,
                что отличает «Силант».
            </p>

            <div className="features-section__groups">
                {FEATURE_GROUPS.map((group) => (
                    <section
                        key={group.id}
                        className="features-group"
                        aria-labelledby={`features-group-${group.id}`}
                    >
                        <h3 id={`features-group-${group.id}`} className="features-group__title">
                            {group.title}
                        </h3>

                        <ul className="features-grid">
                            {group.items.map((item) => (
                                <li key={item.id} className="feature-card">
                                    <div className="feature-card__icon-wrapper" aria-hidden="true">
                                        {/* Иконка скорее декоративная — текст ниже содержит смысл */}
                                        <img
                                            src={item.iconSrc}
                                            alt=""
                                            className="feature-card__icon"
                                            loading="lazy"
                                        />
                                    </div>
                                    <div className="feature-card__text">
                                        <p className="feature-card__label">{item.label}</p>
                                        {item.description && (
                                            <p className="feature-card__description">{item.description}</p>
                                        )}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </section>
                ))}
            </div>
        </section>
    )
}

export default FeatureIconsSection
