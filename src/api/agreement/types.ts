export type AgreementType =
  | 'TERMS_OF_SERVICE'
  | 'PRIVACY_COLLECTION_USE'
  | 'MARKETING';

export type AgreementAction = 'AGREE' | 'REVOKE';

export type AgreementInputContext = 'INDIVIDUAL' | 'BULK';

export interface AgreementStatusItem {
  type: AgreementType;
  required: boolean;
  agreed: boolean;
}

export interface AgreementStatusResponse {
  eligible: boolean;
  items: AgreementStatusItem[];
}

export interface AgreementSubmitItem {
  type: AgreementType;
  action: AgreementAction;
  content: string;
  inputContext: AgreementInputContext;
}

export interface AgreementSubmitRequest {
  agreements: AgreementSubmitItem[];
}
