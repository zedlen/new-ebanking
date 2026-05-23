import type { AuthMeResponse, UserProfile } from '@/shared/types/user'

export function mapAuthMeToProfile(me: AuthMeResponse): UserProfile | null {
  const customerId = me.id || me.external_id  

  if (!customerId || me.taxpayer_type_id == null) {
    return null
  }

  return {
    customer_id: customerId,
    customer_type: me.customer_type,
    id: me.id,
    username: me.username,
    taxpayer_type_id: me.taxpayer_type_id,
    role_id: me.role_id,
    external_id: me.external_id,
    account_customer_id: me.account_customer_id,
    rfc: me.rfc,
    name: me.name,
    ap_paterno: me.ap_paterno,
    ap_materno: me.ap_materno,
    company_name: me.company_name,
    contact_name: me.contact_name,
    contact_email: me.contact_email,
    contact_tel: me.contact_tel,
    email: me.email,
    image: me.image,
    address: me.address,
    creation_date: me.creation_date,
    level: me.level,
    affiliation_code: me.affiliation_code,
  }
}
