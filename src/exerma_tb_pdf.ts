/* ---------------------------------------------------------------------------
 *  (c) Patrick Seuret, 2023-2024
 * ---------------------------------------------------------------------------
 *  exerma_tb_pdf.js
 * ---------------------------------------------------------------------------
 *
 * Create the PDF of an email
 * Documentation about jsPDF: https://parall.ax/products/jspdf
 * 
 * Versions:
 *   2024-07-20: Add: In createPdf(): Activate useCORS in pdfFile.html() function which fixed load of pictures
 *   2024-01-04: Add: Use plain text version of message in createPdf() if html version is missing
 *   2023-11-18: First version (move createPDF() from project_main.ts)
 * 
 */

    // --------------- Imports
    import type * as ex                         from '../node_modules/@exerma/exerma_ts_base/dist/exerma_types'
    import jsPDF                                from 'jspdf'
    import {
             tbExploreMessagePartStructure,
             tbGetMessagePartBody
            }                                   from './exerma_tb_messages'
    import { loadResourceHtml, loadResource }   from './exerma_tb_misc'
    import { exLangFuture }                     from './exerma_tb_lang'
    import {
                log,
                cInfoStarted,
                cRaiseUnexpected
            }                                   from '../node_modules/@exerma/exerma_ts_base/dist/exerma_log'
    import {
                datetimeToFieldReplacement,
                numberToByteSize
            }                                   from '../node_modules/@exerma/exerma_ts_base/dist/exerma_misc'
    import {
             createAndAddElement,
             setElementByIdAttribute,
             setElementByIdInnerContent
            }                                   from '../node_modules/@exerma/exerma_ts_base/dist/exerma_dom'


    // ----- PDF template
    const cResourcePdfTemplate: string   = './pdf_template.html'
    const cHtmlPdfTemplateSubjectLabelId: string = 'subjectLabelId'
    const cHtmlPdfTemplateSubjectContentId: string = 'subjectContentId'
    const cHtmlPdfTemplateSenderLabelId: string = 'senderLabelId'
    const cHtmlPdfTemplateSenderContentId: string = 'senderContentId'
    const cHtmlPdfTemplateDateLabelId: string = 'dateLabelId'
    const cHtmlPdfTemplateDateContentId: string = 'dateContentId'
    const cHtmlPdfTemplateToLabelId: string = 'toLabelId'
    const cHtmlPdfTemplateToContentId: string = 'toContentId'
    const cHtmlPdfTemplateCcLabelId: string = 'ccLabelId'
    const cHtmlPdfTemplateCcContentId: string = 'ccContentId'
    const cHtmlPdfTemplateBccLabelId: string = 'bccLabelId'
    const cHtmlPdfTemplateBccContentId: string = 'bccContentId'
    const cHtmlPdfTemplateMailBodyId: string = 'mailBodyId'
    const cHtmlPdfTemplateAttachmentsId: string = 'attachmentsId'
    const cHtmlPdfTemplateAttachmentPClass: string = 'attachmentPClass'
    const cHtmlPdfTemplateAttachmentUlClass: string = 'attachmentUlClass'
    const cHtmlPdfTemplateAttachmentLiClass: string = 'attachmentLiClass'

    /**
     * Create a jsPDF document displaying the provided message
     * Sources:
     *      https://stackoverflow.com/questions/18191893/generate-pdf-from-html-in-div-using-javascript
     *      https://github.com/parallax/jsPDF                  
     * @param {object.messages.MessageHeader} header is the header of the message (contains subject, sender or date)
     * @param {string} resourceName is the name of the resource containing the Html template file to feed
     *                  with the data of the provided message
     * @param {object} htmlTargets is an object giving alternative Id of the fields to feed instead of the 
     *                  default one (see cHtmlPdfTemplateXxxx constants, default Id is the name of each
     *                  parameter of this object).
     * @param {string} htmlTargets.subjectLabelId is the field Id to use instead of the default field
     * @param {string} htmlTargets.subjectContentId is the field Id to use instead of the default field
     * @param {string} htmlTargets.senderLabelId is the field Id to use instead of the default field
     * @param {string} htmlTargets.senderContentId is the field Id to use instead of the default field
     * @param {string} htmlTargets.dateLabelId is the field Id to use instead of the default field
     * @param {string} htmlTargets.dateContentId is the field Id to use instead of the default field
     * @param {string} htmlTargets.toLabelId is the field Id to use instead of the default field
     * @param {string} htmlTargets.toContentId is the field Id to use instead of the default field
     * @param {string} htmlTargets.ccLabelId is the field Id to use instead of the default field
     * @param {string} htmlTargets.ccContentId is the field Id to use instead of the default field
     * @param {string} htmlTargets.bccLabelId is the field Id to use instead of the default field
     * @param {string} htmlTargets.bccContentId is the field Id to use instead of the default field
     * @param {string} htmlTargets.mailBodyId is the field Id to use instead of the default field
     * @param {string} htmlTargets.attachmentId is the field Id to use instead of the default field
     * @param {string} htmlTargets.attachmentPClass is the field Id to use instead of the default field
     * @param {string} htmlTargets.attachmentUlClass is the field Id to use instead of the default field
     * @param {string} htmlTargets.attachmentLiClass is the field Id to use instead of the default field
     * @param {object} params is used to set additional parameters
     * @param {boolean} params.noHtml is used to return an undefined Html Document (if true).
     *                  Default is to return the built Document object
     * @param {boolean} params.noPdf is used to not generate the Pdf object (if true). 
     *                  Default is to return the built PDF object
     * @returns {Promise<jsPDF|undefined,Document|undefined>} is the PDF and Html-Document objects
     *                  created from the provided message. They can be undefined if an error occurs
     *                  or if the user asked for noHtml or noPdf
     */
    export async function createPdf (header: messenger.messages.MessageHeader,
                                     resourceName: string,
                                     htmlTargets?: {
                                        subjectLabelId?: string
                                        subjectContentId?: string
                                        senderLabelId?: string
                                        senderContentId?: string
                                        dateLabelId?: string
                                        dateContentId?: string
                                        toLabelId?: string
                                        toContentId?: string
                                        ccLabelId?: string
                                        ccContentId?: string
                                        bccLabelId?: string
                                        bccContentId?: string
                                        mailBodyId?: string
                                        attachmentId?: string
                                        attachmentPClass?: string
                                        attachmentUlClass?: string
                                        attachmentLiClass?: string
                                     },
                                     params?: {
                                        noHtml?: boolean
                                        noPdf?: boolean
                                     }): Promise<[jsPDF | undefined, Document | undefined]> {
        
        const cSourceName = 'exerma_tb/exerma_tb_pdf.ts/createPdf'


        try {

            log().trace(cSourceName, cInfoStarted)
    
            // Retrieve the template page
            let myDoc: Document | undefined = await loadResourceHtml(resourceName)
    
            if ((params?.noHtml ?? false) && (params?.noPdf ?? false)) {
                // Nothing to do
                return [undefined, undefined]
            }
            log().debugInfo(cSourceName, 'Resource loaded: ' + (myDoc === undefined ? 'failure' : 'success'))
            if (myDoc === undefined) {
    
                log().debugInfo(cSourceName, 'Unable to load resource file: ' + resourceName)
                
                // Create a dummy Html page from scratch
                const myDOM: DOMImplementation = document.implementation
                myDoc = myDOM.createHTMLDocument(header.subject)
                const myTag: HTMLElement = myDoc.createElement('p')
                myTag.setAttribute('id', htmlTargets?.subjectContentId ?? cHtmlPdfTemplateSubjectContentId)
                myDoc.body.appendChild(myTag)
    
            }
    
            // Get html code of the page
            const rawHtml = myDoc.textContent
            // log().debugInfo(cSourceName, 'Html code: ' + rawHtml)
    
            // Set properties of header
            // 1) Set subject
            void feedHeaderField(myDoc,
                                 htmlTargets?.subjectLabelId ?? cHtmlPdfTemplateSubjectLabelId,
                                 exLangFuture('Sujet:'), // lang().getMessage('subject', { ifNotFound: 'Sujet:' }),
                                 htmlTargets?.subjectContentId ?? cHtmlPdfTemplateSubjectContentId,
                                 header.subject)
    
            // 2) Set sender
            void feedHeaderField(myDoc,
                                 htmlTargets?.senderLabelId ?? cHtmlPdfTemplateSenderLabelId,
                                 exLangFuture('De:'),
                                 htmlTargets?.senderContentId ?? cHtmlPdfTemplateSenderContentId,
                                 header.author)
    
            // 3) Set date
            let mailDate: Date = new Date(Date.now())
            if (typeof header.date === 'string') {
                mailDate = new Date(Date.parse(header.date))
            } else
            if (typeof header.date === 'number') {
                mailDate = new Date(header.date)
            }
            void feedHeaderField(myDoc,
                                 htmlTargets?.senderLabelId ?? cHtmlPdfTemplateDateLabelId,
                                 exLangFuture('Date:'),
                                 htmlTargets?.senderContentId ?? cHtmlPdfTemplateDateContentId,
                                 datetimeToFieldReplacement(mailDate).get('full'))
    
            // 4) Set To
            void feedHeaderField(myDoc,
                                 htmlTargets?.senderLabelId ?? cHtmlPdfTemplateToLabelId,
                                 exLangFuture('À:'),
                                 htmlTargets?.senderContentId ?? cHtmlPdfTemplateToContentId,
                                 concatenateListOfPersons(header.recipients))
    
            // 5) Set Cc
            void feedHeaderField(myDoc,
                                 htmlTargets?.senderLabelId ?? cHtmlPdfTemplateCcLabelId,
                                 exLangFuture('Copie:'),
                                 htmlTargets?.senderContentId ?? cHtmlPdfTemplateCcContentId,
                                 concatenateListOfPersons(header.ccList))
    
            // 6) Set Bcc
            void feedHeaderField(myDoc,
                                 htmlTargets?.senderLabelId ?? cHtmlPdfTemplateBccLabelId,
                                 exLangFuture('Caché:'),
                                 htmlTargets?.senderContentId ?? cHtmlPdfTemplateBccContentId,
                                 concatenateListOfPersons(header.bccList))
    
    
            // Set body of email
            const message = await messenger.messages.getFull(header.id)
            let content = ''
            if (message === null) {
                log().debugInfo(cSourceName, 'Cannot retrieve main message')
                content = '<p>Cannot retrieve main message</p>'
            } else {
                content = tbGetMessagePartBody(message, 'text/html')
                if (content === '') {
                    content = tbGetMessagePartBody(message, 'text/plain')
                    if (content !== '') {
                        content = '<pre>' + content + '</pre>'
                        // content = stringPrefixLinesWith(content,
                        //                                 '<p class="notopmargin">',
                        //                                 { suffix: '</p>', replaceEmpty: '&nbsp;' })
                    } else {
                        content = tbExploreMessagePartStructure(message)
                    }
                }
            }
    
            // Extract head and body of the message
            const parser = new DOMParser()
            const msgDoc: Document = parser.parseFromString(content, 'text/html')
            const msgHead = msgDoc.getElementsByTagName('head')
            const msgBody = msgDoc.getElementsByTagName('body')
    
            // void setElementByIdInnerContent(myDoc,
            //                                 htmlTargets?.mailBodyId ?? cHtmlPdfTemplateMailBodyId,
            //                                 (message.size?.toString() ?? '(zero)')
            //                                 + ' coucou: ' + content
            //                                 + (message.body?.length.toString() ?? '(vide)')
            //                                 + (subject?.subject ?? '(no subject)'),
            //                                 false)
            const headContainer = myDoc.getElementsByTagName('head')[0]
            if ((headContainer !== null) && (msgHead.length > 0)) {
                headContainer.insertAdjacentHTML('beforeend', msgHead[0].innerHTML)
            }
    
            const bodyContainer = myDoc.getElementById(htmlTargets?.mailBodyId ?? cHtmlPdfTemplateMailBodyId)
            if ((bodyContainer !== null) && (msgBody.length > 0)) {
                bodyContainer.innerHTML = msgBody[0].innerHTML
            }
    
            // Add attachment
            const attachContainer = myDoc.getElementById(htmlTargets?.attachmentId ?? cHtmlPdfTemplateAttachmentsId)
            const attachments = await messenger.messages.listAttachments(header.id)
            if ((attachContainer !== null) && (myDoc !== undefined) && (attachments !== null) && (attachments.length > 0)) {
                const label = myDoc.createElement('p')
                label.setAttribute('class', htmlTargets?.attachmentPClass ?? cHtmlPdfTemplateAttachmentPClass)
                label.innerText = exLangFuture('Pièces jointes:')
                attachContainer.appendChild(label)

                const list = myDoc.createElement('ul')
                list.setAttribute('class', htmlTargets?.attachmentUlClass ?? cHtmlPdfTemplateAttachmentUlClass)
                attachments.forEach(aFile => {
                    const item = myDoc.createElement('li')
                    item.setAttribute('class', htmlTargets?.attachmentLiClass ?? cHtmlPdfTemplateAttachmentLiClass)
                    item.innerText = aFile.name + ' (' + numberToByteSize(aFile.size, 1) + ')'
                    list.appendChild(item)
                })
                attachContainer.appendChild(list)
            }
            

            // Set document title
            const titleContainers = myDoc.getElementsByTagName('title')
            if (titleContainers.length > 0) {
                titleContainers[0].innerText = header.subject
            }

    
    
            // Create the PDF from the Html
            //   export interface jsPDFOptions {
            //         orientation?: "p" | "portrait" | "l" | "landscape";
            //         unit?: "pt" | "px" | "in" | "mm" | "cm" | "ex" | "em" | "pc";
            //         format?: string | number[];
            //         compress?: boolean;
            //         precision?: number;
            //         filters?: string[];
            //         userUnit?: number;
            //         encryption?: EncryptionOptions;
            //         putOnlyUsedFonts?: boolean;
            //         hotfixes?: string[];
            //         floatPrecision?: number | "smart";
            //     }
            // Documentation: 
            //  - https://rawgit.com/MrRio/jsPDF/master/docs/jsPDF.html (main entry)
            //  - https://html2canvas.hertzen.com/proxy/ (about proxy for external images and fonts)
            //  - https://rawgit.com/MrRio/jsPDF/master/docs/module-html.html (about jsPDF.html() function)
            //  - 
            const pdfFile = new jsPDF({
                orientation: 'portrait',
                unit: 'px',
                format: 'a4',
                compress: false,
                // precision: 64,
                hotfixes: ['px_scaling']
            })
    
            if (!(params?.noPdf ?? false)) {
                await pdfFile.html(myDoc.documentElement, {
                    // margin: [25, 50, 25, 50],
                    html2canvas: {
                        // imageTimeout: 5000,
                        async: true,
                        scale: 0.9,
                        // proxy: 'node.js',
                        // foreignObjectRendering: true,
                        useCORS: true
                    }
                })
            }
    
            // Make html file self-consistant by embodding the CSS in the html file
            const cssFile: ex.uString = await loadResource(resourceName.replace('html', 'css'), 'text') as ex.uString
            void createAndAddElement(myDoc,
                                     'style', {
                                     innerHtml: cssFile,
                                     setAttribute: [{ name: 'type', value: 'text/css' }],
                                     target: myDoc.getElementsByTagName('head')[0],
                                     insertPosition: 'beforeend'
                                     })
            myDoc.close()

            // Finished  (noHtml=true and noPdf=true has been check at the beginning)
            if (params?.noPdf ?? false) {
                return [undefined, myDoc]
            }
            if (params?.noHtml ?? false) {
                return [pdfFile, undefined]
            }
            return [pdfFile, myDoc]

        } catch (error) {
        
            log().raiseError(cSourceName, cRaiseUnexpected, error as Error)

            return [undefined, undefined]

        }

    }


    /**
     * Feed a "label - content" pair of Html elements
     * @param {Document} doc is the Html DOM document to alter
     * @param {string} fieldLabelId is the Id of the html element to feed with the label value
     * @param {string} fieldLabelValue is the label text (not html) to show
     * @param {string} fieldContentId is the Id of the html element to feed with the provided
     *                  context text (not html)
     * @param {string | undefined} fieldContentValue is the innerText text (not html) content to
     *                  assign to the fieldContentId element. If undefined, then the "label - content"
     *                  pair will be hidden (using the "display: hide" attribute)
     * @returns {Promise<boolean>} is true if success, false if not
     */
    async function feedHeaderField (doc: Document,
                                    fieldLabelId: string,
                                    fieldLabelValue: string,
                                    fieldContentId: string,
                                    fieldContentValue: string | undefined): Promise<boolean> {

        const cSourceName = 'exerma_tb/exerma_tb_pdf.ts/feedHeaderField'

        log().trace(cSourceName, cInfoStarted)

        try {
            
            if ((fieldContentValue === undefined) || (fieldContentValue === '')) {

                // Hide the label and content boxes
                void setElementByIdAttribute(doc, fieldLabelId,   'hidden', 'true')
                void setElementByIdAttribute(doc, fieldContentId, 'hidden', 'true')
                return true

            } else {

                // Set label and content
                void setElementByIdInnerContent(doc, fieldContentId, fieldContentValue, false)
                void setElementByIdInnerContent(doc, fieldLabelId, fieldLabelValue, false)
                return true

            }
            
        } catch (error) {
            
            log().raiseError(cSourceName, cRaiseUnexpected, error as Error)
            return false

        }

    }

    /**
     * Concatenate a list of "Person <email@address.com>" into a single string
     * @param {string[]} listOfPersons is the list of persons (with email addresses) to concatenate into a single
     *                  string containing all of them
     * @returns {string} is the concatenation of all the provided individual persons (with or 
     *                  without their adresses)
     */
    function concatenateListOfPersons (listOfPersons: string[]): string {

        const cSourceName = 'exerma_tb/exerma_tb_pdf.ts/concatenateListOfPersons'

        log().trace(cSourceName, cInfoStarted)

        try {
            
            if (listOfPersons.length === 0) {
                return ''
            }

            return listOfPersons.reduce((previousValue, currentValue) => {
                                            return previousValue
                                                + ((previousValue.length === 0 ? '' : ', ')
                                                + currentValue)
                                        })

            
        } catch (error) {
            
            log().raiseError(cSourceName, cRaiseUnexpected, error as Error)
            return ''

        }

    }
