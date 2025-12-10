import React from 'react'

import logoBlue from '../assets/logo/logo-silant-blue.jpg'
import logoRed from '../assets/logo/logo-silant-red.jpg'
import logoBeige from '../assets/logo/logo-silant-beige.svg'

type Variant = 'blue' | 'red' | 'beige'
type Size = 'sm' | 'md' | 'lg'

const VARIANT_SRC: Record<Variant, string> = {
    blue: logoBlue,
    red: logoRed,
    beige: logoBeige,
}

interface BrandLogoProps {
    variant?: Variant
    size?: Size
}


const BrandLogo: React.FC<BrandLogoProps> = ({variant = 'blue', size = 'md'}) => {
    const className = `brand-logo brand-logo--${size}`

    return (
        <img
            className={className}
            src={VARIANT_SRC[variant]}
            alt="Логотип завода «Силант»"
            loading="lazy"
        />
    )
}

export default BrandLogo
