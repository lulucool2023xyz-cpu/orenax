Skip to main content
Google Cloud Documentation
Technology areas

Cross-product tools

Search
/


English
Console


Vertex AI
Generative AI on Vertex AI
Guides
API reference
Vertex AI Cookbook
Prompt gallery
Resources
FAQ
Pricing
Filter

Home
Documentation
AI and ML
Vertex AI
Generative AI on Vertex AI
API reference
Was this helpful?

Send feedbackPackage google.cloud.aiplatform.v1

bookmark_border
Index
DataFoundryService (interface)
EvaluationManagementService (interface)
EvaluationService (interface)
GenAiCacheConfigService (interface)
GenAiCacheService (interface)
GenAiTuningService (interface)
LlmBidiService (interface)
LlmUtilityService (interface)
PredictionService (interface)
ReasoningEngineExecutionService (interface)
ReasoningEngineService (interface)
VertexRagDataService (interface)
VertexRagService (interface)
AggregationOutput (message)
AggregationResult (message)
ApiAuth (message)
ApiAuth.ApiKeyConfig (message)
AugmentPromptRequest (message)
AugmentPromptRequest.Model (message)
AugmentPromptResponse (message)
AuthConfig (message)
AuthConfig.ApiKeyConfig (message)
AuthConfig.GoogleServiceAccountConfig (message)
AuthConfig.HttpBasicAuthConfig (message)
AuthConfig.OauthConfig (message)
AuthConfig.OidcConfig (message)
AuthType (enum)
AutoraterConfig (message)
BidiGenerateContentClientContent (message)
BidiGenerateContentClientMessage (message)
BidiGenerateContentRealtimeInput (message)
BidiGenerateContentRealtimeInput.ActivityEnd (message)
BidiGenerateContentRealtimeInput.ActivityStart (message)
BidiGenerateContentServerContent (message)
BidiGenerateContentServerContent.Transcription (message)
BidiGenerateContentServerContent.TurnCompleteReason (enum)
BidiGenerateContentServerMessage (message)
BidiGenerateContentSetup (message)
BidiGenerateContentSetup.AudioTranscriptionConfig (message)
BidiGenerateContentSetupComplete (message)
BidiGenerateContentToolCall (message)
BidiGenerateContentToolCallCancellation (message)
BidiGenerateContentToolResponse (message)
BigQueryDestination (message)
BigQueryRequestSet (message)
BigQueryRequestSet.SamplingConfig (message)
BigQueryRequestSet.SamplingConfig.SamplingMethod (enum)
BigQuerySource (message)
BleuInput (message)
BleuInstance (message)
BleuMetricValue (message)
BleuResults (message)
BleuSpec (message)
Blob (message)
CacheConfig (message)
CachedContent (message)
CachedContent.UsageMetadata (message)
CancelEvaluationRunRequest (message)
CancelTuningJobRequest (message)
Candidate (message)
Candidate.FinishReason (enum)
CandidateResponse (message)
CandidateResult (message)
ChatCompletionsRequest (message)
Citation (message)
CitationMetadata (message)
Claim (message)
CodeExecutionResult (message)
CodeExecutionResult.Outcome (enum)
CoherenceInput (message)
CoherenceInstance (message)
CoherenceResult (message)
CoherenceSpec (message)
CometInput (message)
CometInstance (message)
CometResult (message)
CometSpec (message)
CometSpec.CometVersion (enum)
ComputeTokensRequest (message)
ComputeTokensResponse (message)
Content (message)
ContentMap (message)
ContentMap.Contents (message)
ContextWindowCompressionConfig (message)
ContextWindowCompressionConfig.SlidingWindow (message)
CorpusStatus (message)
CorpusStatus.State (enum)
CorroborateContentRequest (message)
CorroborateContentRequest.Parameters (message)
CorroborateContentResponse (message)
CountTokensRequest (message)
CountTokensResponse (message)
CreateCachedContentRequest (message)
CreateEvaluationItemRequest (message)
CreateEvaluationRunRequest (message)
CreateEvaluationSetRequest (message)
CreateRagCorpusOperationMetadata (message)
CreateRagCorpusRequest (message)
CreateReasoningEngineOperationMetadata (message)
CreateReasoningEngineRequest (message)
CreateTuningJobRequest (message)
CustomCodeExecutionResult (message)
CustomCodeExecutionSpec (message)
CustomOutput (message)
CustomOutputFormatConfig (message)
DatasetDistribution (message)
DatasetDistribution.DistributionBucket (message)
DeleteCachedContentRequest (message)
DeleteEvaluationItemRequest (message)
DeleteEvaluationRunOperationMetadata (message)
DeleteEvaluationRunRequest (message)
DeleteEvaluationSetRequest (message)
DeleteOperationMetadata (message)
DeleteRagCorpusRequest (message)
DeleteRagFileRequest (message)
DeleteReasoningEngineRequest (message)
DenoiserConfig (message)
DirectUploadSource (message)
DnsPeeringConfig (message)
DynamicRetrievalConfig (message)
DynamicRetrievalConfig.Mode (enum)
EmbedContentRequest (message)
EmbedContentRequest.EmbeddingTaskType (enum)
EmbedContentResponse (message)
EmbedContentResponse.Embedding (message)
EncryptionSpec (message)
EnterpriseWebSearch (message)
EnvVar (message)
EvaluateDatasetOperationMetadata (message)
EvaluateDatasetRequest (message)
EvaluateDatasetResponse (message)
EvaluateInstancesRequest (message)
EvaluateInstancesResponse (message)
EvaluationDataset (message)
EvaluationInstance (message)
EvaluationInstance.AgentConfig (message)
EvaluationInstance.AgentConfig.Tools (message)
EvaluationInstance.AgentData (message)
EvaluationInstance.AgentData.Events (message)
EvaluationInstance.AgentData.Tools (message)
EvaluationInstance.InstanceData (message)
EvaluationInstance.InstanceData.Contents (message)
EvaluationInstance.MapInstance (message)
EvaluationItem (message)
EvaluationItem.EvaluationItemType (enum)
EvaluationPrompt (message)
EvaluationPrompt.PromptTemplateData (message)
EvaluationRequest (message)
EvaluationResult (message)
EvaluationResults (message)
EvaluationRubricConfig (message)
EvaluationRun (message)
EvaluationRun.DataSource (message)
EvaluationRun.EvaluationConfig (message)
EvaluationRun.EvaluationConfig.AutoraterConfig (message)
EvaluationRun.EvaluationConfig.OutputConfig (message)
EvaluationRun.EvaluationConfig.PromptTemplate (message)
EvaluationRun.InferenceConfig (message)
EvaluationRun.State (enum)
EvaluationRunMetric (message)
EvaluationRunMetric.LLMBasedMetricSpec (message)
EvaluationRunMetric.PredefinedMetricSpec (message)
EvaluationRunMetric.RubricBasedMetricSpec (message)
EvaluationRunMetric.RubricBasedMetricSpec.RepeatedRubrics (message)
EvaluationRunMetric.RubricGenerationSpec (message)
EvaluationRunMetric.RubricGenerationSpec.RubricContentType (enum)
EvaluationSet (message)
ExactMatchInput (message)
ExactMatchInstance (message)
ExactMatchMetricValue (message)
ExactMatchResults (message)
ExactMatchSpec (message)
ExecutableCode (message)
ExecutableCode.Language (enum)
ExternalApi (message)
ExternalApi.ApiSpec (enum)
ExternalApi.ElasticSearchParams (message)
ExternalApi.SimpleSearchParams (message)
Fact (message)
FetchPredictOperationRequest (message)
FileData (message)
FileStatus (message)
FileStatus.State (enum)
FluencyInput (message)
FluencyInstance (message)
FluencyResult (message)
FluencySpec (message)
FulfillmentInput (message)
FulfillmentInstance (message)
FulfillmentResult (message)
FulfillmentSpec (message)
FunctionCall (message)
FunctionCallingConfig (message)
FunctionCallingConfig.Mode (enum)
FunctionDeclaration (message)
FunctionResponse (message)
FunctionResponseBlob (message)
FunctionResponseFileData (message)
FunctionResponsePart (message)
GcsDestination (message)
GcsSource (message)
GeminiPreferenceExample (message)
GeminiPreferenceExample.Completion (message)
GenerateContentRequest (message)
GenerateContentResponse (message)
GenerateContentResponse.PromptFeedback (message)
GenerateContentResponse.PromptFeedback.BlockedReason (enum)
GenerateContentResponse.UsageMetadata (message)
GenerateContentResponse.UsageMetadata.TrafficType (enum)
GenerateInstanceRubricsRequest (message)
GenerateInstanceRubricsResponse (message)
GenerateSyntheticDataRequest (message)
GenerateSyntheticDataResponse (message)
GenerationConfig (message)
GenerationConfig.MediaResolution (enum)
GenerationConfig.Modality (enum)
GenerationConfig.RoutingConfig (message)
GenerationConfig.RoutingConfig.AutoRoutingMode (message)
GenerationConfig.RoutingConfig.AutoRoutingMode.ModelRoutingPreference (enum)
GenerationConfig.RoutingConfig.ManualRoutingMode (message)
GenerationConfig.ThinkingConfig (message)
GenerationConfig.ThinkingConfig.ThinkingLevel (enum)
GenericOperationMetadata (message)
GetCacheConfigRequest (message)
GetCachedContentRequest (message)
GetEvaluationItemRequest (message)
GetEvaluationRunRequest (message)
GetEvaluationSetRequest (message)
GetRagCorpusRequest (message)
GetRagEngineConfigRequest (message)
GetRagFileRequest (message)
GetReasoningEngineRequest (message)
GetTuningJobRequest (message)
GoAway (message)
GoogleDriveSource (message)
GoogleDriveSource.ResourceId (message)
GoogleDriveSource.ResourceId.ResourceType (enum)
GoogleMaps (message)
GoogleSearchRetrieval (message)
GroundednessInput (message)
GroundednessInstance (message)
GroundednessResult (message)
GroundednessSpec (message)
GroundingChunk (message)
GroundingChunk.Maps (message)
GroundingChunk.Maps.PlaceAnswerSources (message)
GroundingChunk.Maps.PlaceAnswerSources.ReviewSnippet (message)
GroundingChunk.RetrievedContext (message)
GroundingChunk.Web (message)
GroundingMetadata (message)
GroundingMetadata.SourceFlaggingUri (message)
GroundingSupport (message)
HarmCategory (enum)
HttpElementLocation (enum)
ImageConfig (message)
ImageConfig.ImageOutputOptions (message)
ImageConfig.PersonGeneration (enum)
ImportRagFilesConfig (message)
ImportRagFilesOperationMetadata (message)
ImportRagFilesRequest (message)
ImportRagFilesResponse (message)
InvokeRequest (message)
JiraSource (message)
JiraSource.JiraQueries (message)
JobState (enum)
LLMBasedMetricSpec (message)
ListCachedContentsRequest (message)
ListCachedContentsResponse (message)
ListEvaluationItemsRequest (message)
ListEvaluationItemsResponse (message)
ListEvaluationRunsRequest (message)
ListEvaluationRunsResponse (message)
ListEvaluationSetsRequest (message)
ListEvaluationSetsResponse (message)
ListRagCorporaRequest (message)
ListRagCorporaResponse (message)
ListRagFilesRequest (message)
ListRagFilesResponse (message)
ListReasoningEnginesRequest (message)
ListReasoningEnginesResponse (message)
ListTuningJobsRequest (message)
ListTuningJobsResponse (message)
LogprobsResult (message)
LogprobsResult.Candidate (message)
LogprobsResult.TopCandidates (message)
MemoryBankCustomizationConfig (message)
MemoryBankCustomizationConfig.GenerateMemoriesExample (message)
MemoryBankCustomizationConfig.GenerateMemoriesExample.ConversationSource (message)
MemoryBankCustomizationConfig.GenerateMemoriesExample.ConversationSource.Event (message)
MemoryBankCustomizationConfig.GenerateMemoriesExample.GeneratedMemory (message)
MemoryBankCustomizationConfig.MemoryTopic (message)
MemoryBankCustomizationConfig.MemoryTopic.CustomMemoryTopic (message)
MemoryBankCustomizationConfig.MemoryTopic.ManagedMemoryTopic (message)
MemoryBankCustomizationConfig.MemoryTopic.ManagedMemoryTopic.ManagedTopicEnum (enum)
MemoryTopicId (message)
Metric (message)
Metric.AggregationMetric (enum)
MetricResult (message)
MetricxInput (message)
MetricxInstance (message)
MetricxResult (message)
MetricxSpec (message)
MetricxSpec.MetricxVersion (enum)
Modality (enum)
ModalityTokenCount (message)
ModelArmorConfig (message)
MultiSpeakerVoiceConfig (message)
OutputConfig (message)
OutputFieldSpec (message)
OutputFieldSpec.FieldType (enum)
OutputInfo (message)
PairwiseChoice (enum)
PairwiseMetricInput (message)
PairwiseMetricInstance (message)
PairwiseMetricResult (message)
PairwiseMetricSpec (message)
PairwiseQuestionAnsweringQualityInput (message)
PairwiseQuestionAnsweringQualityInstance (message)
PairwiseQuestionAnsweringQualityResult (message)
PairwiseQuestionAnsweringQualitySpec (message)
PairwiseSummarizationQualityInput (message)
PairwiseSummarizationQualityInstance (message)
PairwiseSummarizationQualityResult (message)
PairwiseSummarizationQualitySpec (message)
Part (message)
Part.MediaResolution (message)
Part.MediaResolution.Level (enum)
PartialArg (message)
PointwiseMetricInput (message)
PointwiseMetricInstance (message)
PointwiseMetricResult (message)
PointwiseMetricSpec (message)
PreTunedModel (message)
PrebuiltVoiceConfig (message)
PredefinedMetricSpec (message)
PredictLongRunningRequest (message)
PredictRequest (message)
PredictResponse (message)
PreferenceOptimizationDataStats (message)
PreferenceOptimizationHyperParameters (message)
PreferenceOptimizationSpec (message)
ProactivityConfig (message)
PscInterfaceConfig (message)
QueryReasoningEngineRequest (message)
QueryReasoningEngineResponse (message)
QuestionAnsweringCorrectnessInput (message)
QuestionAnsweringCorrectnessInstance (message)
QuestionAnsweringCorrectnessResult (message)
QuestionAnsweringCorrectnessSpec (message)
QuestionAnsweringHelpfulnessInput (message)
QuestionAnsweringHelpfulnessInstance (message)
QuestionAnsweringHelpfulnessResult (message)
QuestionAnsweringHelpfulnessSpec (message)
QuestionAnsweringQualityInput (message)
QuestionAnsweringQualityInstance (message)
QuestionAnsweringQualityResult (message)
QuestionAnsweringQualitySpec (message)
QuestionAnsweringRelevanceInput (message)
QuestionAnsweringRelevanceInstance (message)
QuestionAnsweringRelevanceResult (message)
QuestionAnsweringRelevanceSpec (message)
RagChunk (message)
RagChunk.PageSpan (message)
RagContexts (message)
RagContexts.Context (message)
RagCorpus (message)
RagEmbeddingModelConfig (message)
RagEmbeddingModelConfig.VertexPredictionEndpoint (message)
RagEngineConfig (message)
RagFile (message)
RagFileChunkingConfig (message)
RagFileChunkingConfig.FixedLengthChunking (message)
RagFileParsingConfig (message)
RagFileParsingConfig.LayoutParser (message)
RagFileParsingConfig.LlmParser (message)
RagFileTransformationConfig (message)
RagManagedDbConfig (message)
RagManagedDbConfig.Basic (message)
RagManagedDbConfig.Scaled (message)
RagManagedDbConfig.Unprovisioned (message)
RagQuery (message)
RagRetrievalConfig (message)
RagRetrievalConfig.Filter (message)
RagRetrievalConfig.Ranking (message)
RagRetrievalConfig.Ranking.LlmRanker (message)
RagRetrievalConfig.Ranking.RankService (message)
RagVectorDbConfig (message)
RagVectorDbConfig.Pinecone (message)
RagVectorDbConfig.RagManagedDb (message)
RagVectorDbConfig.RagManagedDb.ANN (message)
RagVectorDbConfig.RagManagedDb.KNN (message)
RagVectorDbConfig.VertexVectorSearch (message)
RawOutput (message)
RawPredictRequest (message)
RealtimeInputConfig (message)
RealtimeInputConfig.ActivityHandling (enum)
RealtimeInputConfig.AutomaticActivityDetection (message)
RealtimeInputConfig.AutomaticActivityDetection.EndSensitivity (enum)
RealtimeInputConfig.AutomaticActivityDetection.StartSensitivity (enum)
RealtimeInputConfig.TurnCoverage (enum)
ReasoningEngine (message)
ReasoningEngineContextSpec (message)
ReasoningEngineContextSpec.MemoryBankConfig (message)
ReasoningEngineContextSpec.MemoryBankConfig.GenerationConfig (message)
ReasoningEngineContextSpec.MemoryBankConfig.SimilaritySearchConfig (message)
ReasoningEngineContextSpec.MemoryBankConfig.TtlConfig (message)
ReasoningEngineContextSpec.MemoryBankConfig.TtlConfig.GranularTtlConfig (message)
ReasoningEngineSpec (message)
ReasoningEngineSpec.DeploymentSpec (message)
ReasoningEngineSpec.PackageSpec (message)
ReasoningEngineSpec.SourceCodeSpec (message)
ReasoningEngineSpec.SourceCodeSpec.DeveloperConnectConfig (message)
ReasoningEngineSpec.SourceCodeSpec.DeveloperConnectSource (message)
ReasoningEngineSpec.SourceCodeSpec.InlineSource (message)
ReasoningEngineSpec.SourceCodeSpec.PythonSpec (message)
RebaseTunedModelOperationMetadata (message)
RebaseTunedModelRequest (message)
ReplicatedVoiceConfig (message)
Retrieval (message)
RetrievalConfig (message)
RetrievalMetadata (message)
RetrieveContextsRequest (message)
RetrieveContextsRequest.VertexRagStore (message)
RetrieveContextsRequest.VertexRagStore.RagResource (message)
RetrieveContextsResponse (message)
RougeInput (message)
RougeInstance (message)
RougeMetricValue (message)
RougeResults (message)
RougeSpec (message)
Rubric (message)
Rubric.Content (message)
Rubric.Content.Property (message)
Rubric.Importance (enum)
RubricBasedInstructionFollowingInput (message)
RubricBasedInstructionFollowingInstance (message)
RubricBasedInstructionFollowingResult (message)
RubricBasedInstructionFollowingSpec (message)
RubricCritiqueResult (message)
RubricGenerationSpec (message)
RubricGenerationSpec.RubricContentType (enum)
RubricGroup (message)
RubricVerdict (message)
SafetyInput (message)
SafetyInstance (message)
SafetyRating (message)
SafetyRating.HarmProbability (enum)
SafetyRating.HarmSeverity (enum)
SafetyResult (message)
SafetySetting (message)
SafetySetting.HarmBlockMethod (enum)
SafetySetting.HarmBlockThreshold (enum)
SafetySpec (message)
Schema (message)
SearchEntryPoint (message)
SecretEnvVar (message)
SecretRef (message)
Segment (message)
SessionResumptionConfig (message)
SessionResumptionUpdate (message)
SharePointSources (message)
SharePointSources.SharePointSource (message)
SlackSource (message)
SlackSource.SlackChannels (message)
SlackSource.SlackChannels.SlackChannel (message)
SpeakerVoiceConfig (message)
SpeechConfig (message)
StreamDirectPredictRequest (message)
StreamDirectPredictResponse (message)
StreamDirectRawPredictRequest (message)
StreamDirectRawPredictResponse (message)
StreamQueryReasoningEngineRequest (message)
StreamRawPredictRequest (message)
StreamingPredictRequest (message)
StreamingPredictResponse (message)
StreamingRawPredictRequest (message)
StreamingRawPredictResponse (message)
SummarizationHelpfulnessInput (message)
SummarizationHelpfulnessInstance (message)
SummarizationHelpfulnessResult (message)
SummarizationHelpfulnessSpec (message)
SummarizationQualityInput (message)
SummarizationQualityInstance (message)
SummarizationQualityResult (message)
SummarizationQualitySpec (message)
SummarizationVerbosityInput (message)
SummarizationVerbosityInstance (message)
SummarizationVerbosityResult (message)
SummarizationVerbositySpec (message)
SummaryMetrics (message)
SupervisedHyperParameters (message)
SupervisedHyperParameters.AdapterSize (enum)
SupervisedTuningDataStats (message)
SupervisedTuningDatasetDistribution (message)
SupervisedTuningDatasetDistribution.DatasetBucket (message)
SupervisedTuningSpec (message)
SyntheticExample (message)
SyntheticField (message)
TaskDescriptionStrategy (message)
Tensor (message)
Tensor.DataType (enum)
TokensInfo (message)
Tool (message)
Tool.CodeExecution (message)
Tool.ComputerUse (message)
Tool.ComputerUse.Environment (enum)
Tool.GoogleSearch (message)
Tool.PhishBlockThreshold (enum)
ToolCall (message)
ToolCallValidInput (message)
ToolCallValidInstance (message)
ToolCallValidMetricValue (message)
ToolCallValidResults (message)
ToolCallValidSpec (message)
ToolConfig (message)
ToolNameMatchInput (message)
ToolNameMatchInstance (message)
ToolNameMatchMetricValue (message)
ToolNameMatchResults (message)
ToolNameMatchSpec (message)
ToolParameterKVMatchInput (message)
ToolParameterKVMatchInstance (message)
ToolParameterKVMatchMetricValue (message)
ToolParameterKVMatchResults (message)
ToolParameterKVMatchSpec (message)
ToolParameterKeyMatchInput (message)
ToolParameterKeyMatchInstance (message)
ToolParameterKeyMatchMetricValue (message)
ToolParameterKeyMatchResults (message)
ToolParameterKeyMatchSpec (message)
Trajectory (message)
TrajectoryAnyOrderMatchInput (message)
TrajectoryAnyOrderMatchInstance (message)
TrajectoryAnyOrderMatchMetricValue (message)
TrajectoryAnyOrderMatchResults (message)
TrajectoryAnyOrderMatchSpec (message)
TrajectoryExactMatchInput (message)
TrajectoryExactMatchInstance (message)
TrajectoryExactMatchMetricValue (message)
TrajectoryExactMatchResults (message)
TrajectoryExactMatchSpec (message)
TrajectoryInOrderMatchInput (message)
TrajectoryInOrderMatchInstance (message)
TrajectoryInOrderMatchMetricValue (message)
TrajectoryInOrderMatchResults (message)
TrajectoryInOrderMatchSpec (message)
TrajectoryPrecisionInput (message)
TrajectoryPrecisionInstance (message)
TrajectoryPrecisionMetricValue (message)
TrajectoryPrecisionResults (message)
TrajectoryPrecisionSpec (message)
TrajectoryRecallInput (message)
TrajectoryRecallInstance (message)
TrajectoryRecallMetricValue (message)
TrajectoryRecallResults (message)
TrajectoryRecallSpec (message)
TrajectorySingleToolUseInput (message)
TrajectorySingleToolUseInstance (message)
TrajectorySingleToolUseMetricValue (message)
TrajectorySingleToolUseResults (message)
TrajectorySingleToolUseSpec (message)
TunedModel (message)
TunedModelCheckpoint (message)
TunedModelRef (message)
TuningDataStats (message)
TuningJob (message)
Type (enum)
UpdateCacheConfigOperationMetadata (message)
UpdateCacheConfigRequest (message)
UpdateCachedContentRequest (message)
UpdateEvaluationSetRequest (message)
UpdateRagCorpusOperationMetadata (message)
UpdateRagCorpusRequest (message)
UpdateRagEngineConfigOperationMetadata (message)
UpdateRagEngineConfigRequest (message)
UpdateReasoningEngineOperationMetadata (message)
UpdateReasoningEngineRequest (message)
UploadRagFileConfig (message)
UrlContext (message)
UrlContextMetadata (message)
UrlMetadata (message)
UrlMetadata.UrlRetrievalStatus (enum)
UsageMetadata (message)
UsageMetadata.TrafficType (enum)
VertexAISearch (message)
VertexAISearch.DataStoreSpec (message)
VertexAiSearchConfig (message)
VertexRagStore (message)
VertexRagStore.RagResource (message)
VideoMetadata (message)
VoiceConfig (message)
DataFoundryService
Service for generating and preparing datasets for Gen AI evaluation.

GenerateSyntheticData
rpc GenerateSyntheticData(GenerateSyntheticDataRequest) returns (GenerateSyntheticDataResponse)

Generates synthetic data based on the provided configuration.

EvaluationManagementService
Vertex AI Evaluation Management Service.

CancelEvaluationRun
rpc CancelEvaluationRun(CancelEvaluationRunRequest) returns (Empty)

Cancels an Evaluation Run. Attempts to cancel a running Evaluation Run asynchronously. Status of run can be checked via GetEvaluationRun.

CreateEvaluationItem
rpc CreateEvaluationItem(CreateEvaluationItemRequest) returns (EvaluationItem)

Creates an Evaluation Item.

CreateEvaluationRun
rpc CreateEvaluationRun(CreateEvaluationRunRequest) returns (EvaluationRun)

Creates an Evaluation Run.

CreateEvaluationSet
rpc CreateEvaluationSet(CreateEvaluationSetRequest) returns (EvaluationSet)

Creates an Evaluation Set.

DeleteEvaluationItem
rpc DeleteEvaluationItem(DeleteEvaluationItemRequest) returns (Operation)

Deletes an Evaluation Item.

DeleteEvaluationRun
rpc DeleteEvaluationRun(DeleteEvaluationRunRequest) returns (Operation)

Deletes an Evaluation Run.

DeleteEvaluationSet
rpc DeleteEvaluationSet(DeleteEvaluationSetRequest) returns (Operation)

Deletes an Evaluation Set.

GetEvaluationItem
rpc GetEvaluationItem(GetEvaluationItemRequest) returns (EvaluationItem)

Gets an Evaluation Item.

GetEvaluationRun
rpc GetEvaluationRun(GetEvaluationRunRequest) returns (EvaluationRun)

Gets an Evaluation Run.

GetEvaluationSet
rpc GetEvaluationSet(GetEvaluationSetRequest) returns (EvaluationSet)

Gets an Evaluation Set.

ListEvaluationItems
rpc ListEvaluationItems(ListEvaluationItemsRequest) returns (ListEvaluationItemsResponse)

Lists Evaluation Items.

ListEvaluationRuns
rpc ListEvaluationRuns(ListEvaluationRunsRequest) returns (ListEvaluationRunsResponse)

Lists Evaluation Runs.

ListEvaluationSets
rpc ListEvaluationSets(ListEvaluationSetsRequest) returns (ListEvaluationSetsResponse)

Lists Evaluation Sets.

UpdateEvaluationSet
rpc UpdateEvaluationSet(UpdateEvaluationSetRequest) returns (EvaluationSet)

Updates an Evaluation Set.

EvaluationService
Vertex AI Online Evaluation Service.

EvaluateDataset
rpc EvaluateDataset(EvaluateDatasetRequest) returns (Operation)

Evaluates a dataset based on a set of given metrics.

EvaluateInstances
rpc EvaluateInstances(EvaluateInstancesRequest) returns (EvaluateInstancesResponse)

Evaluates instances based on a given metric.

IAM Permissions
Requires the following IAM permission on the location resource:

aiplatform.locations.evaluateInstances
For more information, see the IAM documentation.

GenerateInstanceRubrics
rpc GenerateInstanceRubrics(GenerateInstanceRubricsRequest) returns (GenerateInstanceRubricsResponse)

Generates rubrics for a given prompt. A rubric represents a single testable criterion for evaluation. One input prompt could have multiple rubrics This RPC allows users to get suggested rubrics based on provided prompt, which can then be reviewed and used for subsequent evaluations.

GenAiCacheConfigService
Service for GenAI Cache Config.

GetCacheConfig
rpc GetCacheConfig(GetCacheConfigRequest) returns (CacheConfig)

Gets a GenAI cache config.

IAM Permissions
Requires the following IAM permission on the name resource:

aiplatform.cacheConfigs.get
For more information, see the IAM documentation.

UpdateCacheConfig
rpc UpdateCacheConfig(UpdateCacheConfigRequest) returns (Operation)

Updates a cache config.

IAM Permissions
Requires the following IAM permission on the name resource:

aiplatform.cacheConfigs.update
For more information, see the IAM documentation.

GenAiCacheService
Service for managing Vertex AI's CachedContent resource.

CreateCachedContent
rpc CreateCachedContent(CreateCachedContentRequest) returns (CachedContent)

Creates cached content, this call will initialize the cached content in the data storage, and users need to pay for the cache data storage.

IAM Permissions
Requires the following IAM permission on the parent resource:

aiplatform.cachedContents.create
For more information, see the IAM documentation.

DeleteCachedContent
rpc DeleteCachedContent(DeleteCachedContentRequest) returns (Empty)

Deletes cached content

IAM Permissions
Requires the following IAM permission on the name resource:

aiplatform.cachedContents.delete
For more information, see the IAM documentation.

GetCachedContent
rpc GetCachedContent(GetCachedContentRequest) returns (CachedContent)

Gets cached content configurations

IAM Permissions
Requires the following IAM permission on the name resource:

aiplatform.cachedContents.get
For more information, see the IAM documentation.

ListCachedContents
rpc ListCachedContents(ListCachedContentsRequest) returns (ListCachedContentsResponse)

Lists cached contents in a project

IAM Permissions
Requires the following IAM permission on the parent resource:

aiplatform.cachedContents.list
For more information, see the IAM documentation.

UpdateCachedContent
rpc UpdateCachedContent(UpdateCachedContentRequest) returns (CachedContent)

Updates cached content configurations

IAM Permissions
Requires the following IAM permission on the name resource:

aiplatform.cachedContents.update
For more information, see the IAM documentation.

GenAiTuningService
A service for creating and managing GenAI Tuning Jobs.

CancelTuningJob
rpc CancelTuningJob(CancelTuningJobRequest) returns (Empty)

Cancels a TuningJob. Starts asynchronous cancellation on the TuningJob. The server makes a best effort to cancel the job, but success is not guaranteed. Clients can use GenAiTuningService.GetTuningJob or other methods to check whether the cancellation succeeded or whether the job completed despite cancellation. On successful cancellation, the TuningJob is not deleted; instead it becomes a job with a TuningJob.error value with a google.rpc.Status.code of 1, corresponding to Code.CANCELLED, and TuningJob.state is set to CANCELLED.

IAM Permissions
Requires the following IAM permission on the name resource:

aiplatform.tuningJobs.cancel
For more information, see the IAM documentation.

CreateTuningJob
rpc CreateTuningJob(CreateTuningJobRequest) returns (TuningJob)

Creates a TuningJob. A created TuningJob right away will be attempted to be run.

IAM Permissions
Requires the following IAM permission on the parent resource:

aiplatform.tuningJobs.create
For more information, see the IAM documentation.

GetTuningJob
rpc GetTuningJob(GetTuningJobRequest) returns (TuningJob)

Gets a TuningJob.

IAM Permissions
Requires the following IAM permission on the name resource:

aiplatform.tuningJobs.get
For more information, see the IAM documentation.

ListTuningJobs
rpc ListTuningJobs(ListTuningJobsRequest) returns (ListTuningJobsResponse)

Lists TuningJobs in a Location.

IAM Permissions
Requires the following IAM permission on the parent resource:

aiplatform.tuningJobs.list
For more information, see the IAM documentation.

RebaseTunedModel
rpc RebaseTunedModel(RebaseTunedModelRequest) returns (Operation)

Rebase a TunedModel.

IAM Permissions
Requires the following IAM permission on the parent resource:

aiplatform.tuningJobs.create
For more information, see the IAM documentation.

LlmBidiService
A service for LLM related bidirectional low latency APIs.

BidiGenerateContent
rpc BidiGenerateContent(BidiGenerateContentClientMessage) returns (BidiGenerateContentServerMessage)

Bidirectional streaming predict.

IAM Permissions
Requires the following IAM permission on the model resource:

aiplatform.endpoints.predict
For more information, see the IAM documentation.

LlmUtilityService
Service for LLM related utility functions.

ComputeTokens
rpc ComputeTokens(ComputeTokensRequest) returns (ComputeTokensResponse)

Return a list of tokens based on the input text.

IAM Permissions
Requires the following IAM permission on the endpoint resource:

aiplatform.endpoints.predict
For more information, see the IAM documentation.

CountTokens
rpc CountTokens(CountTokensRequest) returns (CountTokensResponse)

Perform a token counting.

IAM Permissions
Requires the following IAM permission on the endpoint resource:

aiplatform.endpoints.predict
For more information, see the IAM documentation.

PredictionService
A service for online predictions and explanations.

ChatCompletions
rpc ChatCompletions(ChatCompletionsRequest) returns (HttpBody)

Exposes an OpenAI-compatible endpoint for chat completions.

IAM Permissions
Requires the following IAM permission on the endpoint resource:

aiplatform.endpoints.predict
For more information, see the IAM documentation.

EmbedContent
rpc EmbedContent(EmbedContentRequest) returns (EmbedContentResponse)

Embed content with multimodal inputs.

IAM Permissions
Requires the following IAM permission on the model resource:

aiplatform.endpoints.predict
For more information, see the IAM documentation.

FetchPredictOperation
rpc FetchPredictOperation(FetchPredictOperationRequest) returns (Operation)

Fetch an asynchronous online prediction operation.

IAM Permissions
Requires the following IAM permission on the endpoint resource:

aiplatform.endpoints.predict
For more information, see the IAM documentation.

GenerateContent
rpc GenerateContent(GenerateContentRequest) returns (GenerateContentResponse)

Generate content with multimodal inputs.

IAM Permissions
Requires the following IAM permission on the model resource:

aiplatform.endpoints.predict
For more information, see the IAM documentation.

Invoke
rpc Invoke(InvokeRequest) returns (HttpBody)

Forwards arbitrary HTTP requests for both streaming and non-streaming cases. To use this method, [invoke_route_prefix][Model.container_spec.invoke_route_prefix] must be set to allow the paths that will be specified in the request.

IAM Permissions
Requires the following IAM permission on the endpoint resource:

aiplatform.endpoints.predict
For more information, see the IAM documentation.

Predict
rpc Predict(PredictRequest) returns (PredictResponse)

Request message for running inference on Google's generative AI models on Vertex AI. You can use this method to perform tasks like image generation, image editing, virtual try-on, visual question answering, video generation, and generating text and multimodal embeddings.

To run inference on a base (non-tuned) Gemini model, see GenerateContent.

IAM Permissions
Requires the following IAM permission on the endpoint resource:

aiplatform.endpoints.predict
For more information, see the IAM documentation.

PredictLongRunning
rpc PredictLongRunning(PredictLongRunningRequest) returns (Operation)

IAM Permissions
Requires the following IAM permission on the endpoint resource:

aiplatform.endpoints.predict
For more information, see the IAM documentation.

RawPredict
rpc RawPredict(RawPredictRequest) returns (HttpBody)

Perform an online prediction with an arbitrary HTTP payload.

The response includes the following HTTP headers:

X-Vertex-AI-Endpoint-Id: ID of the Endpoint that served this prediction.

X-Vertex-AI-Deployed-Model-Id: ID of the Endpoint's DeployedModel that served this prediction.

IAM Permissions
Requires the following IAM permission on the endpoint resource:

aiplatform.endpoints.predict
For more information, see the IAM documentation.

ServerStreamingPredict
rpc ServerStreamingPredict(StreamingPredictRequest) returns (StreamingPredictResponse)

Perform a server-side streaming online prediction request for Vertex LLM streaming.

IAM Permissions
Requires the following IAM permission on the endpoint resource:

aiplatform.endpoints.predict
For more information, see the IAM documentation.

StreamDirectPredict
rpc StreamDirectPredict(StreamDirectPredictRequest) returns (StreamDirectPredictResponse)

Perform a streaming online prediction request to a gRPC model server for Vertex first-party products and frameworks.

IAM Permissions
Requires the following IAM permission on the endpoint resource:

aiplatform.endpoints.predict
For more information, see the IAM documentation.

StreamDirectRawPredict
rpc StreamDirectRawPredict(StreamDirectRawPredictRequest) returns (StreamDirectRawPredictResponse)

Perform a streaming online prediction request to a gRPC model server for custom containers.

IAM Permissions
Requires the following IAM permission on the endpoint resource:

aiplatform.endpoints.predict
For more information, see the IAM documentation.

StreamGenerateContent
rpc StreamGenerateContent(GenerateContentRequest) returns (GenerateContentResponse)

Generate content with multimodal inputs with streaming support.

IAM Permissions
Requires the following IAM permission on the model resource:

aiplatform.endpoints.predict
For more information, see the IAM documentation.

StreamRawPredict
rpc StreamRawPredict(StreamRawPredictRequest) returns (HttpBody)

Perform a streaming online prediction with an arbitrary HTTP payload.

IAM Permissions
Requires the following IAM permission on the endpoint resource:

aiplatform.endpoints.predict
For more information, see the IAM documentation.

StreamingPredict
rpc StreamingPredict(StreamingPredictRequest) returns (StreamingPredictResponse)

Perform a streaming online prediction request for Vertex first-party products and frameworks.

IAM Permissions
Requires the following IAM permission on the endpoint resource:

aiplatform.endpoints.predict
For more information, see the IAM documentation.

StreamingRawPredict
rpc StreamingRawPredict(StreamingRawPredictRequest) returns (StreamingRawPredictResponse)

Perform a streaming online prediction request through gRPC.

IAM Permissions
Requires the following IAM permission on the endpoint resource:

aiplatform.endpoints.predict
For more information, see the IAM documentation.

ReasoningEngineExecutionService
A service for executing queries on Reasoning Engine.

QueryReasoningEngine
rpc QueryReasoningEngine(QueryReasoningEngineRequest) returns (QueryReasoningEngineResponse)

Queries using a reasoning engine.

IAM Permissions
Requires the following IAM permission on the name resource:

aiplatform.reasoningEngines.query
For more information, see the IAM documentation.

StreamQueryReasoningEngine
rpc StreamQueryReasoningEngine(StreamQueryReasoningEngineRequest) returns (HttpBody)

Streams queries using a reasoning engine.

IAM Permissions
Requires the following IAM permission on the name resource:

aiplatform.reasoningEngines.query
For more information, see the IAM documentation.

ReasoningEngineService
A service for managing Vertex AI's Reasoning Engines.

CreateReasoningEngine
rpc CreateReasoningEngine(CreateReasoningEngineRequest) returns (Operation)

Creates a reasoning engine.

IAM Permissions
Requires the following IAM permission on the parent resource:

aiplatform.reasoningEngines.create
For more information, see the IAM documentation.

DeleteReasoningEngine
rpc DeleteReasoningEngine(DeleteReasoningEngineRequest) returns (Operation)

Deletes a reasoning engine.

IAM Permissions
Requires the following IAM permission on the name resource:

aiplatform.reasoningEngines.delete
For more information, see the IAM documentation.

GetReasoningEngine
rpc GetReasoningEngine(GetReasoningEngineRequest) returns (ReasoningEngine)

Gets a reasoning engine.

IAM Permissions
Requires the following IAM permission on the name resource:

aiplatform.reasoningEngines.get
For more information, see the IAM documentation.

ListReasoningEngines
rpc ListReasoningEngines(ListReasoningEnginesRequest) returns (ListReasoningEnginesResponse)

Lists reasoning engines in a location.

IAM Permissions
Requires the following IAM permission on the parent resource:

aiplatform.reasoningEngines.list
For more information, see the IAM documentation.

UpdateReasoningEngine
rpc UpdateReasoningEngine(UpdateReasoningEngineRequest) returns (Operation)

Updates a reasoning engine.

IAM Permissions
Requires the following IAM permission on the name resource:

aiplatform.reasoningEngines.update
For more information, see the IAM documentation.

VertexRagDataService
A service for managing user data for RAG.

CreateRagCorpus
rpc CreateRagCorpus(CreateRagCorpusRequest) returns (Operation)

Creates a RagCorpus.

IAM Permissions
Requires the following IAM permission on the parent resource:

aiplatform.ragCorpora.create
For more information, see the IAM documentation.

DeleteRagCorpus
rpc DeleteRagCorpus(DeleteRagCorpusRequest) returns (Operation)

Deletes a RagCorpus.

IAM Permissions
Requires the following IAM permission on the name resource:

aiplatform.ragCorpora.delete
For more information, see the IAM documentation.

DeleteRagFile
rpc DeleteRagFile(DeleteRagFileRequest) returns (Operation)

Deletes a RagFile.

IAM Permissions
Requires the following IAM permission on the name resource:

aiplatform.ragFiles.delete
For more information, see the IAM documentation.

GetRagCorpus
rpc GetRagCorpus(GetRagCorpusRequest) returns (RagCorpus)

Gets a RagCorpus.

IAM Permissions
Requires the following IAM permission on the name resource:

aiplatform.ragCorpora.get
For more information, see the IAM documentation.

GetRagEngineConfig
rpc GetRagEngineConfig(GetRagEngineConfigRequest) returns (RagEngineConfig)

Gets a RagEngineConfig.

IAM Permissions
Requires the following IAM permission on the name resource:

aiplatform.ragEngineConfigs.get
For more information, see the IAM documentation.

GetRagFile
rpc GetRagFile(GetRagFileRequest) returns (RagFile)

Gets a RagFile.

IAM Permissions
Requires the following IAM permission on the name resource:

aiplatform.ragFiles.get
For more information, see the IAM documentation.

ImportRagFiles
rpc ImportRagFiles(ImportRagFilesRequest) returns (Operation)

Import files from Google Cloud Storage or Google Drive into a RagCorpus.

IAM Permissions
Requires the following IAM permission on the parent resource:

aiplatform.ragFiles.import
For more information, see the IAM documentation.

ListRagCorpora
rpc ListRagCorpora(ListRagCorporaRequest) returns (ListRagCorporaResponse)

Lists RagCorpora in a Location.

IAM Permissions
Requires the following IAM permission on the parent resource:

aiplatform.ragCorpora.list
For more information, see the IAM documentation.

ListRagFiles
rpc ListRagFiles(ListRagFilesRequest) returns (ListRagFilesResponse)

Lists RagFiles in a RagCorpus.

IAM Permissions
Requires the following IAM permission on the parent resource:

aiplatform.ragFiles.list
For more information, see the IAM documentation.

UpdateRagCorpus
rpc UpdateRagCorpus(UpdateRagCorpusRequest) returns (Operation)

Updates a RagCorpus.

IAM Permissions
Requires the following IAM permission on the name resource:

aiplatform.ragCorpora.update
For more information, see the IAM documentation.

UpdateRagEngineConfig
rpc UpdateRagEngineConfig(UpdateRagEngineConfigRequest) returns (Operation)

Updates a RagEngineConfig.

IAM Permissions
Requires the following IAM permission on the name resource:

aiplatform.ragEngineConfigs.update
For more information, see the IAM documentation.

VertexRagService
A service for retrieving relevant contexts.

AugmentPrompt
rpc AugmentPrompt(AugmentPromptRequest) returns (AugmentPromptResponse)

Given an input prompt, it returns augmented prompt from vertex rag store to guide LLM towards generating grounded responses.

IAM Permissions
Requires the following IAM permission on the parent resource:

aiplatform.ragCorpora.get
For more information, see the IAM documentation.

CorroborateContent
rpc CorroborateContent(CorroborateContentRequest) returns (CorroborateContentResponse)

Given an input text, it returns a score that evaluates the factuality of the text. It also extracts and returns claims from the text and provides supporting facts.

IAM Permissions
Requires the following IAM permission on the parent resource:

aiplatform.ragCorpora.get
For more information, see the IAM documentation.

RetrieveContexts
rpc RetrieveContexts(RetrieveContextsRequest) returns (RetrieveContextsResponse)

Retrieves relevant contexts for a query.

IAM Permissions
Requires the following IAM permission on the parent resource:

aiplatform.ragCorpora.get
For more information, see the IAM documentation.

AggregationOutput
The aggregation result for the entire dataset and all metrics.

Fields
dataset	
EvaluationDataset

The dataset used for evaluation & aggregation.

aggregation_results[]	
AggregationResult

One AggregationResult per metric.

AggregationResult
The aggregation result for a single metric.

Fields
aggregation_metric	
AggregationMetric

Aggregation metric.

Union field aggregation_result. The aggregation result. aggregation_result can be only one of the following:
pointwise_metric_result	
PointwiseMetricResult

Result for pointwise metric.

pairwise_metric_result	
PairwiseMetricResult

Result for pairwise metric.

exact_match_metric_value	
ExactMatchMetricValue

Results for exact match metric.

bleu_metric_value	
BleuMetricValue

Results for bleu metric.

rouge_metric_value	
RougeMetricValue

Results for rouge metric.

custom_code_execution_result	
CustomCodeExecutionResult

Result for code execution metric.

ApiAuth
The generic reusable api auth config. Deprecated. Please use AuthConfig (google/cloud/aiplatform/master/auth.proto) instead.

Fields
Union field auth_config. The auth config. auth_config can be only one of the following:
api_key_config	
ApiKeyConfig

The API secret.

ApiKeyConfig
The API secret.

Fields
api_key_secret_version	
string

Required. The SecretManager secret version resource name storing API key. e.g. projects/{project}/secrets/{secret}/versions/{version}

api_key_string	
string

The API key string.

Either this or api_key_secret_version must be set.

AugmentPromptRequest
Request message for AugmentPrompt.

Fields
parent	
string

Required. The resource name of the Location from which to augment prompt. The users must have permission to make a call in the project. Format: projects/{project}/locations/{location}.

contents[]	
Content

Optional. Input content to augment, only text format is supported for now.

model	
Model

Optional. Metadata of the backend deployed model.

Union field data_source. The data source for retrieving contexts. data_source can be only one of the following:
vertex_rag_store	
VertexRagStore

Optional. Retrieves contexts from the Vertex RagStore.

Model
Metadata of the backend deployed model.

Fields
model	
string

Optional. The model that the user will send the augmented prompt for content generation.

model_version	
string

Optional. The model version of the backend deployed model.

AugmentPromptResponse
Response message for AugmentPrompt.

Fields
augmented_prompt[]	
Content

Augmented prompt, only text format is supported for now.

facts[]	
Fact

Retrieved facts from RAG data sources.

AuthConfig
Auth configuration to run the extension.

Fields
auth_type	
AuthType

Type of auth scheme.

Union field auth_config.

auth_config can be only one of the following:

api_key_config	
ApiKeyConfig

Config for API key auth.

http_basic_auth_config	
HttpBasicAuthConfig

Config for HTTP Basic auth.

google_service_account_config	
GoogleServiceAccountConfig

Config for Google Service Account auth.

oauth_config	
OauthConfig

Config for user oauth.

oidc_config	
OidcConfig

Config for user OIDC auth.

ApiKeyConfig
Config for authentication with API key.

Fields
name	
string

Optional. The parameter name of the API key. E.g. If the API request is "https://example.com/act?api_key=", "api_key" would be the parameter name.

api_key_secret	
string

Optional. The name of the SecretManager secret version resource storing the API key. Format: projects/{project}/secrets/{secrete}/versions/{version}

If both api_key_secret and api_key_string are specified, this field takes precedence over api_key_string.

If specified, the secretmanager.versions.access permission should be granted to Vertex AI Extension Service Agent (https://cloud.google.com/vertex-ai/docs/general/access-control#service-agents) on the specified resource.

api_key_string	
string

Optional. The API key to be used in the request directly.

http_element_location	
HttpElementLocation

Optional. The location of the API key.

GoogleServiceAccountConfig
Config for Google Service Account Authentication.

Fields
service_account	
string

Optional. The service account that the extension execution service runs as.

If the service account is specified, the iam.serviceAccounts.getAccessToken permission should be granted to Vertex AI Extension Service Agent (https://cloud.google.com/vertex-ai/docs/general/access-control#service-agents) on the specified service account.

If not specified, the Vertex AI Extension Service Agent will be used to execute the Extension.

HttpBasicAuthConfig
Config for HTTP Basic Authentication.

Fields
credential_secret	
string

Required. The name of the SecretManager secret version resource storing the base64 encoded credentials. Format: projects/{project}/secrets/{secrete}/versions/{version}

If specified, the secretmanager.versions.access permission should be granted to Vertex AI Extension Service Agent (https://cloud.google.com/vertex-ai/docs/general/access-control#service-agents) on the specified resource.
OauthConfig
Config for user oauth.

Fields
Union field oauth_config.

oauth_config can be only one of the following:

access_token	
string

Access token for extension endpoint. Only used to propagate token from [[ExecuteExtensionRequest.runtime_auth_config]] at request time.

service_account	
string

The service account used to generate access tokens for executing the Extension.

If the service account is specified, the iam.serviceAccounts.getAccessToken permission should be granted to Vertex AI Extension Service Agent (https://cloud.google.com/vertex-ai/docs/general/access-control#service-agents) on the provided service account.
OidcConfig
Config for user OIDC auth.

Fields
Union field oidc_config.

oidc_config can be only one of the following:

id_token	
string

OpenID Connect formatted ID token for extension endpoint. Only used to propagate token from [[ExecuteExtensionRequest.runtime_auth_config]] at request time.

service_account	
string

The service account used to generate an OpenID Connect (OIDC)-compatible JWT token signed by the Google OIDC Provider (accounts.google.com) for extension endpoint (https://cloud.google.com/iam/docs/create-short-lived-credentials-direct#sa-credentials-oidc).

The audience for the token will be set to the URL in the server url defined in the OpenApi spec.

If the service account is provided, the service account should grant iam.serviceAccounts.getOpenIdToken permission to Vertex AI Extension Service Agent (https://cloud.google.com/vertex-ai/docs/general/access-control#service-agents).

AuthType
Type of Auth.

Enums
AUTH_TYPE_UNSPECIFIED	
NO_AUTH	No Auth.
API_KEY_AUTH	API Key Auth.
HTTP_BASIC_AUTH	HTTP Basic Auth.
GOOGLE_SERVICE_ACCOUNT_AUTH	Google Service Account Auth.
OAUTH	OAuth auth.
OIDC_AUTH	OpenID Connect (OIDC) Auth.
AutoraterConfig
The configs for autorater. This is applicable to both EvaluateInstances and EvaluateDataset.

Fields
autorater_model	
string

Optional. The fully qualified name of the publisher model or tuned autorater endpoint to use.

Publisher model format: projects/{project}/locations/{location}/publishers/*/models/*

Tuned model endpoint format: projects/{project}/locations/{location}/endpoints/{endpoint}

generation_config	
GenerationConfig

Optional. Configuration options for model generation and outputs.

sampling_count	
int32

Optional. Number of samples for each instance in the dataset. If not specified, the default is 4. Minimum value is 1, maximum value is 32.

flip_enabled	
bool

Optional. Default is true. Whether to flip the candidate and baseline responses. This is only applicable to the pairwise metric. If enabled, also provide PairwiseMetricSpec.candidate_response_field_name and PairwiseMetricSpec.baseline_response_field_name. When rendering PairwiseMetricSpec.metric_prompt_template, the candidate and baseline fields will be flipped for half of the samples to reduce bias.

BidiGenerateContentClientContent
Incremental update of the current conversation delivered from the client. All the content here is unconditionally appended to the conversation history and used as part of the prompt to the model to generate content.

A message here will interrupt any current model generation.

Fields
turns[]	
Content

Optional. The content appended to the current conversation with the model.

For single-turn queries, this is a single instance. For multi-turn queries, this is a repeated field that contains conversation history and latest request.

turn_complete	
bool

Optional. If true, indicates that the server content generation should start with the currently accumulated prompt. Otherwise, the server will await additional messages before starting generation.

BidiGenerateContentClientMessage
Messages sent by the client in the BidiGenerateContent RPC call.

Fields
Union field message_type. The type of the message. message_type can be only one of the following:
setup	
BidiGenerateContentSetup

Optional. Message to be sent in the first and only first client message.

client_content	
BidiGenerateContentClientContent

Optional. Incremental update of the current conversation delivered from the client.

realtime_input	
BidiGenerateContentRealtimeInput

Optional. User input that is sent in real time.

tool_response	
BidiGenerateContentToolResponse

Optional. Response to a ToolCallMessage received from the server.

BidiGenerateContentRealtimeInput
User input that is sent in real time.

This is different from ClientContentUpdate in a few ways:

Can be sent continuously without interruption to model generation.
If there is a need to mix data interleaved across the ClientContentUpdate and the RealtimeUpdate, server attempts to optimize for best response, but there are no guarantees.
End of turn is not explicitly specified, but is rather derived from user activity (for example, end of speech).
Even before the end of turn, the data is processed incrementally to optimize for a fast start of the response from the model.
Is always assumed to be the user's input (cannot be used to populate conversation history). //
Fields
media_chunks[]	
Blob

Optional. Inlined bytes data for media input.

audio	
Blob

Optional. These form the realtime audio input stream.

video	
Blob

Optional. These form the realtime video input stream.

activity_start	
ActivityStart

Optional. Marks the start of user activity. This can only be sent if automatic (i.e. server-side) activity detection is disabled.

activity_end	
ActivityEnd

Optional. Marks the end of user activity. This can only be sent if automatic (i.e. server-side) activity detection is disabled.

audio_stream_end	
bool

Optional. Indicates that the audio stream has ended, e.g. because the microphone was turned off.

This should only be sent when automatic activity detection is enabled (which is the default).

The client can reopen the stream by sending an audio message.

text	
string

Optional. These form the realtime text input stream.

ActivityEnd
This type has no fields.

Marks the end of user activity.

ActivityStart
This type has no fields.

Only one of the fields in this message must be set at a time. Marks the start of user activity.

BidiGenerateContentServerContent
Incremental server update generated by the model in response to client messages.

Content is generated as quickly as possible, and not in realtime. Clients may choose to buffer and play it out in realtime.

Fields
turn_complete	
bool

Output only. If true, indicates that the model is done generating. Generation will only start in response to additional client messages. Can be set alongside content, indicating that the content is the last in the turn.

interrupted	
bool

Output only. If true, indicates that a client message has interrupted current model generation. If the client is playing out the content in realtime, this is a good signal to stop and empty the current queue. If the client is playing out the content in realtime, this is a good signal to stop and empty the current playback queue.

generation_complete	
bool

Output only. If true, indicates that the model is done generating.

When model is interrupted while generating there will be no 'generation_complete' message in interrupted turn, it will go through 'interrupted > turn_complete'.

When model assumes realtime playback there will be delay between generation_complete and turn_complete that is caused by model waiting for playback to finish.

grounding_metadata	
GroundingMetadata

Output only. Metadata specifies sources used to ground generated content.

input_transcription	
Transcription

Optional. Input transcription. The transcription is independent to the model turn which means it doesn't imply any ordering between transcription and model turn.

output_transcription	
Transcription

Optional. Output transcription. The transcription is independent to the model turn which means it doesn't imply any ordering between transcription and model turn.

turn_complete_reason	
TurnCompleteReason

Output only. The reason why the turn is complete.

model_turn	
Content

Output only. The content that the model has generated as part of the current conversation with the user.

Transcription
Audio transcription message.

Fields
text	
string

Optional. Transcription text.

finished	
bool

Optional. The bool indicates the end of the transcription.

TurnCompleteReason
The reason why the turn is complete.

Enums
TURN_COMPLETE_REASON_UNSPECIFIED	Reason is unspecified.
MALFORMED_FUNCTION_CALL	The function call generated by the model is invalid.
RESPONSE_REJECTED	The response is rejected by the model.
NEED_MORE_INPUT	Needs more input from the user.
BidiGenerateContentServerMessage
Response message for BidiGenerateContent RPC call.

Fields
usage_metadata	
UsageMetadata

Output only. Usage metadata about the response(s).

Union field message_type. The type of the message. message_type can be only one of the following:
setup_complete	
BidiGenerateContentSetupComplete

Output only. Sent in response to a BidiGenerateContentSetup message from the client.

server_content	
BidiGenerateContentServerContent

Output only. Content generated by the model in response to client messages.

tool_call	
BidiGenerateContentToolCall

Output only. Request for the client to execute the function_calls and return the responses with the matching ids.

tool_call_cancellation	
BidiGenerateContentToolCallCancellation

Output only. Notification for the client that a previously issued ToolCallMessage with the specified ids should have been not executed and should be cancelled.

go_away	
GoAway

Output only. Server will disconnect soon.

session_resumption_update	
SessionResumptionUpdate

Output only. Update of the session resumption state.

BidiGenerateContentSetup
Message to be sent in the first and only first BidiGenerateContentClientMessage. Contains configuration that will apply for the duration of the streaming RPC.

Clients should wait for a BidiGenerateContentSetupComplete message before sending any additional messages.

Fields
model	
string

Required. The fully qualified name of the publisher model.

Publisher model format: projects/{project}/locations/{location}/publishers/*/models/*

generation_config	
GenerationConfig

Optional. Generation config.

The following fields aren't supported:

response_logprobs
response_mime_type
logprobs
response_schema
stop_sequence
routing_config
audio_timestamp
system_instruction	
Content

Optional. The user provided system instructions for the model. Note: only text should be used in parts and content in each part will be in a separate paragraph.

tools[]	
Tool

Optional. A list of Tools the model may use to generate the next response.

A Tool is a piece of code that enables the system to interact with external systems to perform an action, or set of actions, outside of knowledge and scope of the model.

session_resumption	
SessionResumptionConfig

Optional. Configures session resumption mechanism. If included, the server will send periodical SessionResumptionUpdate messages to the client.

context_window_compression	
ContextWindowCompressionConfig

Optional. Configures context window compression mechanism.

If included, server will compress context window to fit into given length.

realtime_input_config	
RealtimeInputConfig

Optional. Configures the handling of realtime input.

input_audio_transcription	
AudioTranscriptionConfig

Optional. The transcription of the input aligns with the input audio language.

output_audio_transcription	
AudioTranscriptionConfig

Optional. The transcription of the output aligns with the language code specified for the output audio.

proactivity	
ProactivityConfig

Optional. Configures the proactivity of the model.

This allows the model to respond proactively to the input and to ignore irrelevant input.

AudioTranscriptionConfig
This type has no fields.

The audio transcription configuration.

BidiGenerateContentSetupComplete
Sent in response to a BidiGenerateContentSetup message from the client.

Fields
session_id	
string

Output only. The session id of the session.

BidiGenerateContentToolCall
Request for the client to execute the function_calls and return the responses with the matching ids.

Fields
function_calls[]	
FunctionCall

Output only. The function call to be executed.

BidiGenerateContentToolCallCancellation
Notification for the client that a previously issued ToolCallMessage with the specified ids should have been not executed and should be cancelled. If there were side-effects to those tool calls, clients may attempt to undo the tool calls. This message occurs only in cases where the clients interrupt server turns.

Fields
ids[]	
string

Output only. The ids of the tool calls to be cancelled.

BidiGenerateContentToolResponse
Client generated response to a ToolCall received from the server. Individual FunctionResponse objects are matched to the respective FunctionCall objects by the id field.

Note that in the unary and server-streaming GenerateContent APIs function calling happens by exchanging the Content parts, while in the bidi GenerateContent APIs function calling happens over these dedicated set of messages.

Fields
function_responses[]	
FunctionResponse

Optional. The response to the function calls.

BigQueryDestination
The BigQuery location for the output content.

Fields
output_uri	
string

Required. BigQuery URI to a project or table, up to 2000 characters long.

When only the project is specified, the Dataset and Table is created. When the full table reference is specified, the Dataset must exist and table must not exist.

Accepted forms:

BigQuery path. For example: bq://projectId or bq://projectId.bqDatasetId or bq://projectId.bqDatasetId.bqTableId.
BigQueryRequestSet
The request set for the evaluation run.

Fields
uri	
string

Required. The URI of a BigQuery table. e.g. bq://projectId.bqDatasetId.bqTableId

prompt_column	
string

Optional. The name of the column that contains the requests to evaluate. This will be in evaluation_item.EvalPrompt format.

rubrics_column	
string

Optional. The name of the column that contains the rubrics. This is in evaluation_rubric.RubricGroup format.

candidate_response_columns	
map<string, string>

Optional. Map of candidate name to candidate response column name. The column will be in evaluation_item.CandidateResponse format.

sampling_config	
SamplingConfig

Optional. The sampling config for the bigquery resource.

SamplingConfig
The sampling config.

Fields
sampling_count	
int32

Optional. The total number of logged data to import. If available data is less than the sampling count, all data will be imported. Default is 100.

sampling_method	
SamplingMethod

Optional. The sampling method to use.

sampling_duration	
Duration

Optional. How long to wait before sampling data from the BigQuery table. If not specified, defaults to 0.

SamplingMethod
The sampling method to use.

Enums
SAMPLING_METHOD_UNSPECIFIED	Unspecified sampling method.
RANDOM	Random sampling.
BigQuerySource
The BigQuery location for the input content.

Fields
input_uri	
string

Required. BigQuery URI to a table, up to 2000 characters long. Accepted forms:

BigQuery path. For example: bq://projectId.bqDatasetId.bqTableId.
BleuInput
Input for bleu metric.

Fields
metric_spec	
BleuSpec

Required. Spec for bleu score metric.

instances[]	
BleuInstance

Required. Repeated bleu instances.

BleuInstance
Spec for bleu instance.

Fields
prediction	
string

Required. Output of the evaluated model.

reference	
string

Required. Ground truth used to compare against the prediction.

BleuMetricValue
Bleu metric value for an instance.

Fields
score	
float

Output only. Bleu score.

BleuResults
Results for bleu metric.

Fields
bleu_metric_values[]	
BleuMetricValue

Output only. Bleu metric values.

BleuSpec
Spec for bleu score metric - calculates the precision of n-grams in the prediction as compared to reference - returns a score ranging between 0 to 1.

Fields
use_effective_order	
bool

Optional. Whether to use_effective_order to compute bleu score.

Blob
A content blob.

A Blob contains data of a specific media type. It is used to represent images, audio, and video.

Fields
mime_type	
string

Required. The IANA standard MIME type of the source data.

data	
bytes

Required. The raw bytes of the data.

display_name	
string

Optional. The display name of the blob. Used to provide a label or filename to distinguish blobs.

This field is only returned in PromptMessage for prompt management. It is used in the Gemini calls only when server-side tools (code_execution, google_search, and url_context) are enabled.

CacheConfig
Config of GenAI caching features. This is a singleton resource.

Fields
name	
string

Identifier. Name of the cache config. Format: - projects/{project}/cacheConfig.

disable_cache	
bool

If set to true, disables GenAI caching. Otherwise caching is enabled.

CachedContent
A resource used in LLM queries for users to explicitly specify what to cache and how to cache.

Fields
name	
string

Immutable. Identifier. The server-generated resource name of the cached content Format: projects/{project}/locations/{location}/cachedContents/{cached_content}

display_name	
string

Optional. Immutable. The user-generated meaningful display name of the cached content.

model	
string

Immutable. The name of the Model to use for cached content. Currently, only the published Gemini base models are supported, in form of projects/{PROJECT}/locations/{LOCATION}/publishers/google/models/{MODEL}

system_instruction	
Content

Optional. Input only. Immutable. Developer set system instruction. Currently, text only

contents[]	
Content

Optional. Input only. Immutable. The content to cache

tools[]	
Tool

Optional. Input only. Immutable. A list of Tools the model may use to generate the next response

tool_config	
ToolConfig

Optional. Input only. Immutable. Tool config. This config is shared for all tools

create_time	
Timestamp

Output only. Creation time of the cache entry.

update_time	
Timestamp

Output only. When the cache entry was last updated in UTC time.

usage_metadata	
UsageMetadata

Output only. Metadata on the usage of the cached content.

encryption_spec	
EncryptionSpec

Input only. Immutable. Customer-managed encryption key spec for a CachedContent. If set, this CachedContent and all its sub-resources will be secured by this key.

Union field expiration. Expiration time of the cached content. expiration can be only one of the following:
expire_time	
Timestamp

Timestamp of when this resource is considered expired. This is always provided on output, regardless of what was sent on input.

ttl	
Duration

Input only. The TTL for this resource. The expiration time is computed: now + TTL.

UsageMetadata
Metadata on the usage of the cached content.

Fields
total_token_count	
int32

Total number of tokens that the cached content consumes.

text_count	
int32

Number of text characters.

image_count	
int32

Number of images.

video_duration_seconds	
int32

Duration of video in seconds.

audio_duration_seconds	
int32

Duration of audio in seconds.

CancelEvaluationRunRequest
Request message for EvaluationManagementService.CancelEvaluationRun.

Fields
name	
string

Required. The name of the EvaluationRun resource to be cancelled. Format: projects/{project}/locations/{location}/evaluationRuns/{evaluation_run}

CancelTuningJobRequest
Request message for GenAiTuningService.CancelTuningJob.

Fields
name	
string

Required. The name of the TuningJob to cancel. Format: projects/{project}/locations/{location}/tuningJobs/{tuning_job}

Candidate
A response candidate generated from the model.

Fields
index	
int32

Output only. The 0-based index of this candidate in the list of generated responses. This is useful for distinguishing between multiple candidates when candidate_count > 1.

content	
Content

Output only. The content of the candidate.

avg_logprobs	
double

Output only. The average log probability of the tokens in this candidate. This is a length-normalized score that can be used to compare the quality of candidates of different lengths. A higher average log probability suggests a more confident and coherent response.

logprobs_result	
LogprobsResult

Output only. The detailed log probability information for the tokens in this candidate. This is useful for debugging, understanding model uncertainty, and identifying potential "hallucinations".

finish_reason	
FinishReason

Output only. The reason why the model stopped generating tokens. If empty, the model has not stopped generating.

safety_ratings[]	
SafetyRating

Output only. A list of ratings for the safety of a response candidate.

There is at most one rating per category.

citation_metadata	
CitationMetadata

Output only. A collection of citations that apply to the generated content.

grounding_metadata	
GroundingMetadata

Output only. Metadata returned when grounding is enabled. It contains the sources used to ground the generated content.

url_context_metadata	
UrlContextMetadata

Output only. Metadata returned when the model uses the url_context tool to get information from a user-provided URL.

finish_message	
string

Output only. Describes the reason the model stopped generating tokens in more detail. This field is returned only when finish_reason is set.

FinishReason
The reason why the model stopped generating tokens. If this field is empty, the model has not stopped generating.

Enums
FINISH_REASON_UNSPECIFIED	The finish reason is unspecified.
STOP	The model reached a natural stopping point or a configured stop sequence.
MAX_TOKENS	The model generated the maximum number of tokens allowed by the max_output_tokens parameter.
SAFETY	The model stopped generating because the content potentially violates safety policies. NOTE: When streaming, the content field is empty if content filters block the output.
RECITATION	The model stopped generating because the content may be a recitation from a source.
OTHER	The model stopped generating for a reason not otherwise specified.
BLOCKLIST	The model stopped generating because the content contains a term from a configured blocklist.
PROHIBITED_CONTENT	The model stopped generating because the content may be prohibited.
SPII	The model stopped generating because the content may contain sensitive personally identifiable information (SPII).
MALFORMED_FUNCTION_CALL	The model generated a function call that is syntactically invalid and can't be parsed.
MODEL_ARMOR	The model response was blocked by Model Armor.
IMAGE_SAFETY	The generated image potentially violates safety policies.
IMAGE_PROHIBITED_CONTENT	The generated image may contain prohibited content.
IMAGE_RECITATION	The generated image may be a recitation from a source.
IMAGE_OTHER	The image generation stopped for a reason not otherwise specified.
UNEXPECTED_TOOL_CALL	The model generated a function call that is semantically invalid. This can happen, for example, if function calling is not enabled or the generated function is not in the function declaration.
NO_IMAGE	The model was expected to generate an image, but didn't.
CandidateResponse
Responses from model or agent.

Fields
candidate	
string

Required. The name of the candidate that produced the response.

Union field data. The response from the model or agent. data can be only one of the following:
text	
string

Text response.

value	
Value

Fields and values that can be used to populate the response template.

CandidateResult
Result for a single candidate.

Fields
candidate	
string

Required. The candidate that is being evaluated. The value is the same as the candidate name in the EvaluationRequest.

metric	
string

Required. The metric that was evaluated.

explanation	
string

Optional. The explanation for the metric.

rubric_verdicts[]	
RubricVerdict

Optional. The rubric verdicts for the metric.

additional_results	
Value

Optional. Additional results for the metric.

Union field result. The result for the metric. result can be only one of the following:
score	
float

Optional. The score for the metric.

ChatCompletionsRequest
Request message for [PredictionService.ChatCompletions]

Fields
endpoint	
string

Required. The name of the endpoint requested to serve the prediction. Format: projects/{project}/locations/{location}/endpoints/{endpoint}

http_body	
HttpBody

Optional. The prediction input. Supports HTTP headers and arbitrary data payload.

Citation
A citation for a piece of generatedcontent.

Fields
start_index	
int32

Output only. The start index of the citation in the content.

end_index	
int32

Output only. The end index of the citation in the content.

uri	
string

Output only. The URI of the source of the citation.

title	
string

Output only. The title of the source of the citation.

license	
string

Output only. The license of the source of the citation.

publication_date	
Date

Output only. The publication date of the source of the citation.

CitationMetadata
A collection of citations that apply to a piece of generated content.

Fields
citations[]	
Citation

Output only. A list of citations for the content.

Claim
Claim that is extracted from the input text and facts that support it.

Fields
fact_indexes[]	
int32

Indexes of the facts supporting this claim.

start_index	
int32

Index in the input text where the claim starts (inclusive).

end_index	
int32

Index in the input text where the claim ends (exclusive).

score	
float

Confidence score of this corroboration.

CodeExecutionResult
Result of executing the [ExecutableCode].

Only generated when using the [CodeExecution] tool, and always follows a part containing the [ExecutableCode].

Fields
outcome	
Outcome

Required. Outcome of the code execution.

output	
string

Optional. Contains stdout when code execution is successful, stderr or other description otherwise.

Outcome
Enumeration of possible outcomes of the code execution.

Enums
OUTCOME_UNSPECIFIED	Unspecified status. This value should not be used.
OUTCOME_OK	Code execution completed successfully.
OUTCOME_FAILED	Code execution finished but with a failure. stderr should contain the reason.
OUTCOME_DEADLINE_EXCEEDED	Code execution ran for too long, and was cancelled. There may or may not be a partial output present.
CoherenceInput
Input for coherence metric.

Fields
metric_spec	
CoherenceSpec

Required. Spec for coherence score metric.

instance	
CoherenceInstance

Required. Coherence instance.

CoherenceInstance
Spec for coherence instance.

Fields
prediction	
string

Required. Output of the evaluated model.

CoherenceResult
Spec for coherence result.

Fields
explanation	
string

Output only. Explanation for coherence score.

score	
float

Output only. Coherence score.

confidence	
float

Output only. Confidence for coherence score.

CoherenceSpec
Spec for coherence score metric.

Fields
version	
int32

Optional. Which version to use for evaluation.

CometInput
Input for Comet metric.

Fields
metric_spec	
CometSpec

Required. Spec for comet metric.

instance	
CometInstance

Required. Comet instance.

CometInstance
Spec for Comet instance - The fields used for evaluation are dependent on the comet version.

Fields
prediction	
string

Required. Output of the evaluated model.

reference	
string

Optional. Ground truth used to compare against the prediction.

source	
string

Optional. Source text in original language.

CometResult
Spec for Comet result - calculates the comet score for the given instance using the version specified in the spec.

Fields
score	
float

Output only. Comet score. Range depends on version.

CometSpec
Spec for Comet metric.

Fields
source_language	
string

Optional. Source language in BCP-47 format.

target_language	
string

Optional. Target language in BCP-47 format. Covers both prediction and reference.

version	
CometVersion

Required. Which version to use for evaluation.

CometVersion
Comet version options.

Enums
COMET_VERSION_UNSPECIFIED	Comet version unspecified.
COMET_22_SRC_REF	Comet 22 for translation + source + reference (source-reference-combined).
ComputeTokensRequest
Request message for ComputeTokens RPC call.

Fields
endpoint	
string

Required. The name of the Endpoint requested to get lists of tokens and token ids.

instances[]	
Value

Optional. The instances that are the input to token computing API call. Schema is identical to the prediction schema of the text model, even for the non-text models, like chat models, or Codey models.

model	
string

Optional. The name of the publisher model requested to serve the prediction. Format: projects/{project}/locations/{location}/publishers/*/models/*

contents[]	
Content

Optional. Input content.

ComputeTokensResponse
Response message for ComputeTokens RPC call.

Fields
tokens_info[]	
TokensInfo

Lists of tokens info from the input. A ComputeTokensRequest could have multiple instances with a prompt in each instance. We also need to return lists of tokens info for the request with multiple instances.

Content
The structured data content of a message.

A Content message contains a role field, which indicates the producer of the content, and a parts field, which contains the multi-part data of the message.

Fields
role	
string

Optional. The producer of the content. Must be either 'user' or 'model'.

If not set, the service will default to 'user'.

parts[]	
Part

Required. A list of Part objects that make up a single message. Parts of a message can have different MIME types.

A Content message must have at least one Part.

ContentMap
Map of placeholder in metric prompt template to contents of model input.

Fields
values	
map<string, Contents>

Optional. Map of placeholder to contents.

Repeated Content type.

Fields
contents[]	
Content

Optional. Repeated contents.

ContextWindowCompressionConfig
Enables context window compression -- mechanism managing model context window so it does not exceed given length.

Fields
Union field compression_mechanism. Context window compression mechanism. compression_mechanism can be only one of the following:
sliding_window	
SlidingWindow

Sliding window compression mechanism.

trigger_tokens	
int64

Number of tokens (before running turn) that triggers context window compression mechanism.

This can be also used as latency/quality knob. Shorter windows might run faster.

If not set 80% of model context window will be used, leaving 20% for next user request/model response.

SlidingWindow
Context window will be truncated by keeping only suffix of it. Context window will always be cut at start of USER role turn. System instructions and BidiGenerateContentSetup.prefix_turns will not be subject to the sliding window mechanism, they will always stay at the beginning of context window.

Fields
target_tokens	
int64

Session reduction target -- how many tokens we should keep.

Window shortening operation has some latency costs, so we should avoid running it on every turn.

Should be < trigger_tokens. If not set, trigger_tokens/2 is assumed.

CorpusStatus
RagCorpus status.

Fields
state	
State

Output only. RagCorpus life state.

error_status	
string

Output only. Only when the state field is ERROR.

State
RagCorpus life state.

Enums
UNKNOWN	This state is not supposed to happen.
INITIALIZED	RagCorpus resource entry is initialized, but hasn't done validation.
ACTIVE	RagCorpus is provisioned successfully and is ready to serve.
ERROR	RagCorpus is in a problematic situation. See error_message field for details.
CorroborateContentRequest
Request message for CorroborateContent.

Fields
parent	
string

Required. The resource name of the Location from which to corroborate text. The users must have permission to make a call in the project. Format: projects/{project}/locations/{location}.

facts[]	
Fact

Optional. Facts used to generate the text can also be used to corroborate the text.

parameters	
Parameters

Optional. Parameters that can be set to override default settings per request.

content	
Content

Optional. Input content to corroborate, only text format is supported for now.

Parameters
Parameters that can be overrided per request.

Fields
citation_threshold	
double

Optional. Only return claims with citation score larger than the threshold.

CorroborateContentResponse
Response message for CorroborateContent.

Fields
claims[]	
Claim

Claims that are extracted from the input content and facts that support the claims.

corroboration_score	
float

Confidence score of corroborating content. Value is [0,1] with 1 is the most confidence.

CountTokensRequest
Request message for [PredictionService.CountTokens][].

Fields
endpoint	
string

Required. The name of the Endpoint requested to perform token counting. Format: projects/{project}/locations/{location}/endpoints/{endpoint}

model	
string

Optional. The name of the publisher model requested to serve the prediction. Format: projects/{project}/locations/{location}/publishers/*/models/*

instances[]	
Value

Optional. The instances that are the input to token counting call. Schema is identical to the prediction schema of the underlying model.

contents[]	
Content

Optional. Input content.

tools[]	
Tool

Optional. A list of Tools the model may use to generate the next response.

A Tool is a piece of code that enables the system to interact with external systems to perform an action, or set of actions, outside of knowledge and scope of the model.

system_instruction	
Content

Optional. The user provided system instructions for the model. Note: only text should be used in parts and content in each part will be in a separate paragraph.

generation_config	
GenerationConfig

Optional. Generation config that the model will use to generate the response.

CountTokensResponse
Response message for [PredictionService.CountTokens][].

Fields
total_tokens	
int32

The total number of tokens counted across all instances from the request.

total_billable_characters	
int32

The total number of billable characters counted across all instances from the request.

prompt_tokens_details[]	
ModalityTokenCount

Output only. List of modalities that were processed in the request input.

CreateCachedContentRequest
Request message for GenAiCacheService.CreateCachedContent.

Fields
parent	
string

Required. The parent resource where the cached content will be created

cached_content	
CachedContent

Required. The cached content to create

CreateEvaluationItemRequest
Request message for EvaluationManagementService.CreateEvaluationItem.

Fields
parent	
string

Required. The resource name of the Location to create the Evaluation Item in. Format: projects/{project}/locations/{location}

evaluation_item	
EvaluationItem

Required. The Evaluation Item to create.

CreateEvaluationRunRequest
Request message for EvaluationManagementService.CreateEvaluationRun.

Fields
parent	
string

Required. The resource name of the Location to create the Evaluation Run in. Format: projects/{project}/locations/{location}

evaluation_run	
EvaluationRun

Required. The Evaluation Run to create.

CreateEvaluationSetRequest
Request message for EvaluationManagementService.CreateEvaluationSet.

Fields
parent	
string

Required. The resource name of the Location to create the Evaluation Set in. Format: projects/{project}/locations/{location}

evaluation_set	
EvaluationSet

Required. The Evaluation Set to create.

CreateRagCorpusOperationMetadata
Runtime operation information for VertexRagDataService.CreateRagCorpus.

Fields
generic_metadata	
GenericOperationMetadata

The operation generic information.

CreateRagCorpusRequest
Request message for VertexRagDataService.CreateRagCorpus.

Fields
parent	
string

Required. The resource name of the Location to create the RagCorpus in. Format: projects/{project}/locations/{location}

rag_corpus	
RagCorpus

Required. The RagCorpus to create.

CreateReasoningEngineOperationMetadata
Details of ReasoningEngineService.CreateReasoningEngine operation.

Fields
generic_metadata	
GenericOperationMetadata

The common part of the operation metadata.

CreateReasoningEngineRequest
Request message for ReasoningEngineService.CreateReasoningEngine.

Fields
parent	
string

Required. The resource name of the Location to create the ReasoningEngine in. Format: projects/{project}/locations/{location}

reasoning_engine	
ReasoningEngine

Required. The ReasoningEngine to create.

CreateTuningJobRequest
Request message for GenAiTuningService.CreateTuningJob.

Fields
parent	
string

Required. The resource name of the Location to create the TuningJob in. Format: projects/{project}/locations/{location}

tuning_job	
TuningJob

Required. The TuningJob to create.

CustomCodeExecutionResult
Result for custom code execution metric.

Fields
score	
float

Output only. Custom code execution score.

CustomCodeExecutionSpec
Specificies a metric that is populated by evaluating user-defined Python code.

Fields
evaluation_function	
string

Required. Python function. Expected user to define the following function, e.g.: def evaluate(instance: dict[str, Any]) -> float: Please include this function signature in the code snippet. Instance is the evaluation instance, any fields populated in the instance are available to the function as instance[field_name].

Example: Example input:

instance= EvaluationInstance( response=EvaluationInstance.InstanceData(text="The answer is 4."), reference=EvaluationInstance.InstanceData(text="4") )

Example converted input:

{ 'response': {'text': 'The answer is 4.'}, 'reference': {'text': '4'} }

Example python function:

def evaluate(instance: dict[str, Any]) -> float: if instance['response']['text'] == instance['reference']['text']: return 1.0 return 0.0

CustomCodeExecutionSpec is also supported in Batch Evaluation (EvalDataset RPC) and Tuning Evaluation. Each line in the input jsonl file will be converted to dict[str, Any] and passed to the evaluation function.

CustomOutput
Spec for custom output.

Fields
Union field custom_output. Custom output. custom_output can be only one of the following:
raw_outputs	
RawOutput

Output only. List of raw output strings.

CustomOutputFormatConfig
Spec for custom output format configuration.

Fields
Union field custom_output_format_config. Custom output format configuration. custom_output_format_config can be only one of the following:
return_raw_output	
bool

Optional. Whether to return raw output.

DatasetDistribution
Distribution computed over a tuning dataset.

Fields
sum	
double

Output only. Sum of a given population of values.

min	
double

Output only. The minimum of the population values.

max	
double

Output only. The maximum of the population values.

mean	
double

Output only. The arithmetic mean of the values in the population.

median	
double

Output only. The median of the values in the population.

p5	
double

Output only. The 5th percentile of the values in the population.

p95	
double

Output only. The 95th percentile of the values in the population.

buckets[]	
DistributionBucket

Output only. Defines the histogram bucket.

DistributionBucket
Dataset bucket used to create a histogram for the distribution given a population of values.

Fields
count	
int64

Output only. Number of values in the bucket.

left	
double

Output only. Left bound of the bucket.

right	
double

Output only. Right bound of the bucket.

DeleteCachedContentRequest
Request message for GenAiCacheService.DeleteCachedContent.

Fields
name	
string

Required. The resource name referring to the cached content

DeleteEvaluationItemRequest
Request message for EvaluationManagementService.DeleteEvaluationItem.

Fields
name	
string

Required. The name of the EvaluationItem resource to be deleted. Format: projects/{project}/locations/{location}/evaluationItems/{evaluation_item}

DeleteEvaluationRunOperationMetadata
Operation metadata for EvaluationManagementService.DeleteEvaluationRun.

Fields
generic_metadata	
GenericOperationMetadata

Generic operation metadata.

DeleteEvaluationRunRequest
Request message for EvaluationManagementService.DeleteEvaluationRun.

Fields
name	
string

Required. The name of the EvaluationRun resource to be deleted. Format: projects/{project}/locations/{location}/evaluationRuns/{evaluation_run}

DeleteEvaluationSetRequest
Request message for EvaluationManagementService.DeleteEvaluationSet.

Fields
name	
string

Required. The name of the EvaluationSet resource to be deleted. Format: projects/{project}/locations/{location}/evaluationSets/{evaluation_set}

DeleteOperationMetadata
Details of operations that perform deletes of any entities.

Fields
generic_metadata	
GenericOperationMetadata

The common part of the operation metadata.

DeleteRagCorpusRequest
Request message for VertexRagDataService.DeleteRagCorpus.

Fields
name	
string

Required. The name of the RagCorpus resource to be deleted. Format: projects/{project}/locations/{location}/ragCorpora/{rag_corpus}

force	
bool

Optional. If set to true, any RagFiles in this RagCorpus will also be deleted. Otherwise, the request will only work if the RagCorpus has no RagFiles.

DeleteRagFileRequest
Request message for VertexRagDataService.DeleteRagFile.

Fields
name	
string

Required. The name of the RagFile resource to be deleted. Format: projects/{project}/locations/{location}/ragCorpora/{rag_corpus}/ragFiles/{rag_file}

force_delete	
bool

Optional. If set to true, any errors generated by external vector database during the deletion will be ignored. The default value is false.

DeleteReasoningEngineRequest
Request message for ReasoningEngineService.DeleteReasoningEngine.

Fields
name	
string

Required. The name of the ReasoningEngine resource to be deleted. Format: projects/{project}/locations/{location}/reasoningEngines/{reasoning_engine}

force	
bool

Optional. If set to true, child resources of this reasoning engine will also be deleted. Otherwise, the request will fail with FAILED_PRECONDITION error when the reasoning engine has undeleted child resources.

DenoiserConfig
This type has no fields.

Configuration of denoiser.

DirectUploadSource
This type has no fields.

The input content is encapsulated and uploaded in the request.

DnsPeeringConfig
DNS peering configuration. These configurations are used to create DNS peering zones in the Vertex tenant project VPC, enabling resolution of records within the specified domain hosted in the target network's Cloud DNS.

Fields
domain	
string

Required. The DNS name suffix of the zone being peered to, e.g., "my-internal-domain.corp.". Must end with a dot.

target_project	
string

Required. The project ID hosting the Cloud DNS managed zone that contains the 'domain'. The Vertex AI Service Agent requires the dns.peer role on this project.

target_network	
string

Required. The VPC network name in the target_project where the DNS zone specified by 'domain' is visible.

DynamicRetrievalConfig
Describes the options to customize dynamic retrieval.

Fields
mode	
Mode

The mode of the predictor to be used in dynamic retrieval.

dynamic_threshold	
float

Optional. The threshold to be used in dynamic retrieval. If not set, a system default value is used.

Mode
The mode of the predictor to be used in dynamic retrieval.

Enums
MODE_UNSPECIFIED	Always trigger retrieval.
MODE_DYNAMIC	Run retrieval only when system decides it is necessary.
EmbedContentRequest
Request message for PredictionService.EmbedContent.

Fields
model	
string

Required. The name of the publisher model requested to serve the prediction. Format: projects/{project}/locations/{location}/publishers/*/models/*

content	
Content

Required. Input content to be embedded. Required.

title	
string

Optional. An optional title for the text.

task_type	
EmbeddingTaskType

Optional. The task type of the embedding.

output_dimensionality	
int32

Optional. Optional reduced dimension for the output embedding. If set, excessive values in the output embedding are truncated from the end.

auto_truncate	
bool

Optional. Whether to silently truncate the input content if it's longer than the maximum sequence length.

EmbeddingTaskType
Represents a downstream task the embeddings will be used for.

Enums
UNSPECIFIED	Unset value, which will default to one of the other enum values.
RETRIEVAL_QUERY	Specifies the given text is a query in a search/retrieval setting.
RETRIEVAL_DOCUMENT	Specifies the given text is a document from the corpus being searched.
SEMANTIC_SIMILARITY	Specifies the given text will be used for STS.
CLASSIFICATION	Specifies that the given text will be classified.
CLUSTERING	Specifies that the embeddings will be used for clustering.
QUESTION_ANSWERING	Specifies that the embeddings will be used for question answering.
FACT_VERIFICATION	Specifies that the embeddings will be used for fact verification.
CODE_RETRIEVAL_QUERY	Specifies that the embeddings will be used for code retrieval.
EmbedContentResponse
Response message for PredictionService.EmbedContent.

Fields
embedding	
Embedding

The embedding generated from the input content.

usage_metadata	
UsageMetadata

Metadata about the response(s).

truncated	
bool

Whether the input content was truncated before generating the embedding.

Embedding
A list of floats representing an embedding.

Fields
values[]	
float

Embedding vector values.

EncryptionSpec
Represents a customer-managed encryption key spec that can be applied to a top-level resource.

Fields
kms_key_name	
string

Required. The Cloud KMS resource identifier of the customer managed encryption key used to protect a resource. Has the form: projects/my-project/locations/my-region/keyRings/my-kr/cryptoKeys/my-key. The key needs to be in the same region as where the compute resource is created.

EnterpriseWebSearch
Tool to search public web data, powered by Vertex AI Search and Sec4 compliance.

Fields
exclude_domains[]	
string

Optional. List of domains to be excluded from the search results. The default limit is 2000 domains.

blocking_confidence	
PhishBlockThreshold

Optional. Sites with confidence level chosen & above this value will be blocked from the search results.

EnvVar
Represents an environment variable present in a Container or Python Module.

Fields
name	
string

Required. Name of the environment variable. Must be a valid C identifier.

value	
string

Required. Variables that reference a $(VAR_NAME) are expanded using the previous defined environment variables in the container and any service environment variables. If a variable cannot be resolved, the reference in the input string will be unchanged. The $(VAR_NAME) syntax can be escaped with a double $$, ie: $$(VAR_NAME). Escaped references will never be expanded, regardless of whether the variable exists or not.

EvaluateDatasetOperationMetadata
Operation metadata for Dataset Evaluation.

Fields
generic_metadata	
GenericOperationMetadata

Generic operation metadata.

EvaluateDatasetRequest
Request message for EvaluationService.EvaluateDataset.

Fields
location	
string

Required. The resource name of the Location to evaluate the dataset. Format: projects/{project}/locations/{location}

dataset	
EvaluationDataset

Required. The dataset used for evaluation.

metrics[]	
Metric

Required. The metrics used for evaluation.

output_config	
OutputConfig

Required. Config for evaluation output.

autorater_config	
AutoraterConfig

Optional. Autorater config used for evaluation. Currently only publisher Gemini models are supported. Format: projects/{PROJECT}/locations/{LOCATION}/publishers/google/models/{MODEL}.

EvaluateDatasetResponse
Response in LRO for EvaluationService.EvaluateDataset.

Fields
aggregation_output	
AggregationOutput

Output only. Aggregation statistics derived from results of EvaluationService.EvaluateDataset.

output_info	
OutputInfo

Output only. Output info for EvaluationService.EvaluateDataset.

EvaluateInstancesRequest
Request message for EvaluationService.EvaluateInstances.

Fields
location	
string

Required. The resource name of the Location to evaluate the instances. Format: projects/{project}/locations/{location}

metrics[]	
Metric

The metrics used for evaluation. Currently, we only support evaluating a single metric. If multiple metrics are provided, only the first one will be evaluated.

instance	
EvaluationInstance

The instance to be evaluated.

autorater_config	
AutoraterConfig

Optional. Autorater config used for evaluation.

Union field metric_inputs. Instances and specs for evaluation metric_inputs can be only one of the following:
exact_match_input	
ExactMatchInput

Auto metric instances. Instances and metric spec for exact match metric.

bleu_input	
BleuInput

Instances and metric spec for bleu metric.

rouge_input	
RougeInput

Instances and metric spec for rouge metric.

fluency_input	
FluencyInput

LLM-based metric instance. General text generation metrics, applicable to other categories. Input for fluency metric.

coherence_input	
CoherenceInput

Input for coherence metric.

safety_input	
SafetyInput

Input for safety metric.

groundedness_input	
GroundednessInput

Input for groundedness metric.

fulfillment_input	
FulfillmentInput

Input for fulfillment metric.

summarization_quality_input	
SummarizationQualityInput

Input for summarization quality metric.

pairwise_summarization_quality_input	
PairwiseSummarizationQualityInput

Input for pairwise summarization quality metric.

summarization_helpfulness_input	
SummarizationHelpfulnessInput

Input for summarization helpfulness metric.

summarization_verbosity_input	
SummarizationVerbosityInput

Input for summarization verbosity metric.

question_answering_quality_input	
QuestionAnsweringQualityInput

Input for question answering quality metric.

pairwise_question_answering_quality_input	
PairwiseQuestionAnsweringQualityInput

Input for pairwise question answering quality metric.

question_answering_relevance_input	
QuestionAnsweringRelevanceInput

Input for question answering relevance metric.

question_answering_helpfulness_input	
QuestionAnsweringHelpfulnessInput

Input for question answering helpfulness metric.

question_answering_correctness_input	
QuestionAnsweringCorrectnessInput

Input for question answering correctness metric.

pointwise_metric_input	
PointwiseMetricInput

Input for pointwise metric.

pairwise_metric_input	
PairwiseMetricInput

Input for pairwise metric.

tool_call_valid_input	
ToolCallValidInput

Tool call metric instances. Input for tool call valid metric.

tool_name_match_input	
ToolNameMatchInput

Input for tool name match metric.

tool_parameter_key_match_input	
ToolParameterKeyMatchInput

Input for tool parameter key match metric.

tool_parameter_kv_match_input	
ToolParameterKVMatchInput

Input for tool parameter key value match metric.

comet_input	
CometInput

Translation metrics. Input for Comet metric.

metricx_input	
MetricxInput

Input for Metricx metric.

trajectory_exact_match_input	
TrajectoryExactMatchInput

Input for trajectory exact match metric.

trajectory_in_order_match_input	
TrajectoryInOrderMatchInput

Input for trajectory in order match metric.

trajectory_any_order_match_input	
TrajectoryAnyOrderMatchInput

Input for trajectory match any order metric.

trajectory_precision_input	
TrajectoryPrecisionInput

Input for trajectory precision metric.

trajectory_recall_input	
TrajectoryRecallInput

Input for trajectory recall metric.

trajectory_single_tool_use_input	
TrajectorySingleToolUseInput

Input for trajectory single tool use metric.

rubric_based_instruction_following_input	
RubricBasedInstructionFollowingInput

Rubric Based Instruction Following metric.

EvaluateInstancesResponse
Response message for EvaluationService.EvaluateInstances.

Fields
metric_results[]	
MetricResult

Metric results for each instance. The order of the metric results is guaranteed to be the same as the order of the instances in the request.

Union field evaluation_results. Evaluation results will be served in the same order as presented in EvaluationRequest.instances. evaluation_results can be only one of the following:
exact_match_results	
ExactMatchResults

Auto metric evaluation results. Results for exact match metric.

bleu_results	
BleuResults

Results for bleu metric.

rouge_results	
RougeResults

Results for rouge metric.

fluency_result	
FluencyResult

LLM-based metric evaluation result. General text generation metrics, applicable to other categories. Result for fluency metric.

coherence_result	
CoherenceResult

Result for coherence metric.

safety_result	
SafetyResult

Result for safety metric.

groundedness_result	
GroundednessResult

Result for groundedness metric.

fulfillment_result	
FulfillmentResult

Result for fulfillment metric.

summarization_quality_result	
SummarizationQualityResult

Summarization only metrics. Result for summarization quality metric.

pairwise_summarization_quality_result	
PairwiseSummarizationQualityResult

Result for pairwise summarization quality metric.

summarization_helpfulness_result	
SummarizationHelpfulnessResult

Result for summarization helpfulness metric.

summarization_verbosity_result	
SummarizationVerbosityResult

Result for summarization verbosity metric.

question_answering_quality_result	
QuestionAnsweringQualityResult

Question answering only metrics. Result for question answering quality metric.

pairwise_question_answering_quality_result	
PairwiseQuestionAnsweringQualityResult

Result for pairwise question answering quality metric.

question_answering_relevance_result	
QuestionAnsweringRelevanceResult

Result for question answering relevance metric.

question_answering_helpfulness_result	
QuestionAnsweringHelpfulnessResult

Result for question answering helpfulness metric.

question_answering_correctness_result	
QuestionAnsweringCorrectnessResult

Result for question answering correctness metric.

pointwise_metric_result	
PointwiseMetricResult

Generic metrics. Result for pointwise metric.

pairwise_metric_result	
PairwiseMetricResult

Result for pairwise metric.

tool_call_valid_results	
ToolCallValidResults

Tool call metrics. Results for tool call valid metric.

tool_name_match_results	
ToolNameMatchResults

Results for tool name match metric.

tool_parameter_key_match_results	
ToolParameterKeyMatchResults

Results for tool parameter key match metric.

tool_parameter_kv_match_results	
ToolParameterKVMatchResults

Results for tool parameter key value match metric.

comet_result	
CometResult

Translation metrics. Result for Comet metric.

metricx_result	
MetricxResult

Result for Metricx metric.

trajectory_exact_match_results	
TrajectoryExactMatchResults

Result for trajectory exact match metric.

trajectory_in_order_match_results	
TrajectoryInOrderMatchResults

Result for trajectory in order match metric.

trajectory_any_order_match_results	
TrajectoryAnyOrderMatchResults

Result for trajectory any order match metric.

trajectory_precision_results	
TrajectoryPrecisionResults

Result for trajectory precision metric.

trajectory_recall_results	
TrajectoryRecallResults

Results for trajectory recall metric.

trajectory_single_tool_use_results	
TrajectorySingleToolUseResults

Results for trajectory single tool use metric.

rubric_based_instruction_following_result	
RubricBasedInstructionFollowingResult

Result for rubric based instruction following metric.

EvaluationDataset
The dataset used for evaluation.

Fields
Union field source. The source of the dataset. source can be only one of the following:
gcs_source	
GcsSource

Cloud storage source holds the dataset. Currently only one Cloud Storage file path is supported.

bigquery_source	
BigQuerySource

BigQuery source holds the dataset.

EvaluationInstance
A single instance to be evaluated. Instances are used to specify the input data for evaluation, from simple string comparisons to complex, multi-turn model evaluations

Fields
prompt	
InstanceData

Optional. Data used to populate placeholder prompt in a metric prompt template.

rubric_groups	
map<string, RubricGroup>

Optional. Named groups of rubrics associated with the prompt. This is used for rubric-based evaluations where rubrics can be referenced by a key. The key could represent versions, associated metrics, etc.

response	
InstanceData

Optional. Data used to populate placeholder response in a metric prompt template.

reference	
InstanceData

Optional. Data used to populate placeholder reference in a metric prompt template.

other_data	
MapInstance

Optional. Other data used to populate placeholders based on their key.

agent_data	
AgentData

Optional. Data used for agent evaluation.

AgentConfig
Configuration for an Agent.

Fields
developer_instruction	
InstanceData

Optional. A field containing instructions from the developer for the agent.

Union field tools_data. Data for the tools available to the agent. tools_data can be only one of the following:
tools_text	
string

A JSON string containing a list of tools available to an agent with info such as name, description, parameters and required parameters.

tools	
Tools

List of tools.

Tools
Represents a list of tools for an agent.

Fields
tool[]	
Tool

Optional. List of tools: each tool can have multiple function declarations.

AgentData
Contains data specific to agent evaluations.

Fields
developer_instruction
(deprecated)	
InstanceData

This item is deprecated!

Optional. A field containing instructions from the developer for the agent.

agent_config	
AgentConfig

Optional. Agent configuration.

Union field tools_data. Data for the tools available to the agent. tools_data can be only one of the following:
tools_text
(deprecated)	
string

This item is deprecated!

A JSON string containing a list of tools available to an agent with info such as name, description, parameters and required parameters. Example: [ { "name": "search_actors", "description": "Search for actors in a movie. Returns a list of actors, their roles, their birthdate, and their place of birth.", "parameters": [ { "name": "movie_name", "description": "The name of the movie." }, { "name": "character_name", "description": "The name of the character." } ], "required": ["movie_name", "character_name"] } ]

tools
(deprecated)	
Tools

This item is deprecated!

List of tools.

Union field events_data. The sequence of function calls and function responses that form the agent's trajectory. events_data can be only one of the following:
events	
Events

A list of events.

Events
Represents a list of events for an agent.

Fields
event[]	
Content

Optional. A list of events.

Tools
Represents a list of tools for an agent.

Fields
tool[]
(deprecated)	
Tool

This item is deprecated!

Optional. List of tools: each tool can have multiple function declarations.

InstanceData
Instance data used to populate placeholders in a metric prompt template.

Fields
Union field data. Supported formats for instance data. data can be only one of the following:
text	
string

Text data.

contents	
Contents

List of Gemini content data.

Contents
List of standard Content messages from Gemini API.

Fields
contents[]	
Content

Optional. Repeated contents.

MapInstance
Instance data specified as a map.

Fields
map_instance	
map<string, InstanceData>

Optional. Map of instance data.

EvaluationItem
EvaluationItem is a single evaluation request or result. The content of an EvaluationItem is immutable - it cannot be updated once created. EvaluationItems can be deleted when no longer needed.

Fields
name	
string

Identifier. The resource name of the EvaluationItem. Format: projects/{project}/locations/{location}/evaluationItems/{evaluation_item}

display_name	
string

Required. The display name of the EvaluationItem.

metadata	
Value

Optional. Metadata for the EvaluationItem.

labels	
map<string, string>

Optional. Labels for the EvaluationItem.

evaluation_item_type	
EvaluationItemType

Required. The type of the EvaluationItem.

create_time	
Timestamp

Output only. Timestamp when this item was created.

error	
Status

Output only. Error for the evaluation item.

Union field payload. The request or response for the EvaluationItem. payload can be only one of the following:
evaluation_request	
EvaluationRequest

The request to evaluate.

evaluation_response	
EvaluationResult

Output only. The response from evaluation.

gcs_uri	
string

The Cloud Storage object where the request or response is stored.

EvaluationItemType
The type of the EvaluationItem.

Enums
EVALUATION_ITEM_TYPE_UNSPECIFIED	The default value. This value is unused.
REQUEST	The EvaluationItem is a request to evaluate.
RESULT	The EvaluationItem is the result of evaluation.
EvaluationPrompt
Prompt to be evaluated.

Fields
Union field data. Prompt can be in one of the following formats. data can be only one of the following:
text	
string

Text prompt.

value	
Value

Fields and values that can be used to populate the prompt template.

prompt_template_data	
PromptTemplateData

Prompt template data.

PromptTemplateData
Message to hold a prompt template and the values to populate the template.

Fields
values	
map<string, Content>

The values for fields in the prompt template.

EvaluationRequest
Single evaluation request.

Fields
prompt	
EvaluationPrompt

Required. The request/prompt to evaluate.

golden_response	
CandidateResponse

Optional. The Ideal response or ground truth.

rubrics	
map<string, RubricGroup>

Optional. Named groups of rubrics associated with this prompt. The key is a user-defined name for the rubric group.

candidate_responses[]	
CandidateResponse

Optional. Responses from model under test and other baseline models for comparison.

EvaluationResult
Evaluation result.

Fields
evaluation_request	
string

Required. The request item that was evaluated. Format: projects/{project}/locations/{location}/evaluationItems/{evaluation_item}

evaluation_run	
string

Required. The evaluation run that was used to generate the result. Format: projects/{project}/locations/{location}/evaluationRuns/{evaluation_run}

request	
EvaluationRequest

Required. The request that was evaluated.

metric	
string

Required. The metric that was evaluated.

candidate_results[]	
CandidateResult

Optional. The results for the metric.

metadata	
Value

Optional. Metadata about the evaluation result.

EvaluationResults
The results of the evaluation run.

Fields
summary_metrics	
SummaryMetrics

Optional. The summary metrics for the evaluation run.

evaluation_set	
string

The evaluation set where item level results are stored.

EvaluationRubricConfig
Configuration for a rubric group to be generated/saved for evaluation.

Fields
rubric_group_key	
string

Required. The key used to save the generated rubrics. If a generation spec is provided, this key will be used for the name of the generated rubric group. Otherwise, this key will be used to look up the existing rubric group on the evaluation item. Note that if a rubric group key is specified on both a rubric config and an evaluation metric, the key from the metric will be used to select the rubrics for evaluation.

Union field generation_config. The configuration for generating rubrics. generation_config can be only one of the following:
rubric_generation_spec	
RubricGenerationSpec

Dynamically generate rubrics using this specification.

predefined_rubric_generation_spec	
PredefinedMetricSpec

Dynamically generate rubrics using a predefined spec.

EvaluationRun
EvaluationRun is a resource that represents a single evaluation run, which includes a set of prompts, model responses, evaluation configuration and the resulting metrics.

Fields
name	
string

Identifier. The resource name of the EvaluationRun. This is a unique identifier. Format: projects/{project}/locations/{location}/evaluationRuns/{evaluation_run}

display_name	
string

Required. The display name of the Evaluation Run.

metadata	
Value

Optional. Metadata about the evaluation run, can be used by the caller to store additional tracking information about the evaluation run.

labels	
map<string, string>

Optional. Labels for the evaluation run.

data_source	
DataSource

Required. The data source for the evaluation run.

inference_configs	
map<string, InferenceConfig>

Optional. The candidate to inference config map for the evaluation run. The candidate can be up to 128 characters long and can consist of any UTF-8 characters.

evaluation_config	
EvaluationConfig

Required. The configuration used for the evaluation.

state	
State

Output only. The state of the evaluation run.

error	
Status

Output only. Only populated when the evaluation run's state is FAILED or CANCELLED.

evaluation_results	
EvaluationResults

Output only. The results of the evaluation run. Only populated when the evaluation run's state is SUCCEEDED.

create_time	
Timestamp

Output only. Time when the evaluation run was created.

completion_time	
Timestamp

Output only. Time when the evaluation run was completed.

evaluation_set_snapshot	
string

Output only. The specific evaluation set of the evaluation run. For runs with an evaluation set input, this will be that same set. For runs with BigQuery input, it's the sampled BigQuery dataset.

DataSource
The data source for the evaluation run.

Fields
Union field source. One of multiple supported sources. source can be only one of the following:
evaluation_set	
string

The EvaluationSet resource name. Format: projects/{project}/locations/{location}/evaluationSets/{evaluation_set}

bigquery_request_set	
BigQueryRequestSet

Evaluation data in bigquery.

EvaluationConfig
The Evalution configuration used for the evaluation run.

Fields
metrics[]	
EvaluationRunMetric

Required. The metrics to be calculated in the evaluation run.

rubric_configs[]	
EvaluationRubricConfig

Optional. The rubric configs for the evaluation run. They are used to generate rubrics which can be used by rubric-based metrics. Multiple rubric configs can be specified for rubric generation but only one rubric config can be used for a rubric-based metric. If more than one rubric config is provided, the evaluation metric must specify a rubric group key. Note that if a generation spec is specified on both a rubric config and an evaluation metric, the rubrics generated for the metric will be used for evaluation.

output_config	
OutputConfig

Optional. The output config for the evaluation run.

autorater_config	
AutoraterConfig

Optional. The autorater config for the evaluation run.

prompt_template	
PromptTemplate

The prompt template used for inference. The values for variables in the prompt template are defined in EvaluationItem.EvaluationPrompt.PromptTemplateData.values.

AutoraterConfig
The autorater config used for the evaluation run.

Fields
autorater_model	
string

Optional. The fully qualified name of the publisher model or tuned autorater endpoint to use.

Publisher model format: projects/{project}/locations/{location}/publishers/*/models/*

Tuned model endpoint format: projects/{project}/locations/{location}/endpoints/{endpoint}

generation_config	
GenerationConfig

Optional. Configuration options for model generation and outputs.

sample_count	
int32

Optional. Number of samples for each instance in the dataset. If not specified, the default is 4. Minimum value is 1, maximum value is 32.

OutputConfig
The output config for the evaluation run.

Fields
bigquery_destination	
BigQueryDestination

BigQuery destination for evaluation output.

gcs_destination	
GcsDestination

Cloud Storage destination for evaluation output.

PromptTemplate
Prompt template used for inference.

Fields
Union field source. The source of the prompt template. source can be only one of the following:
prompt_template	
string

Inline prompt template. Template variables should be in the format "{var_name}". Example: "Translate the following from {source_lang} to {target_lang}: {text}"

gcs_uri	
string

Prompt template stored in Cloud Storage. Format: "gs://my-bucket/file-name.txt".

InferenceConfig
An inference config used for model inference during the evaluation run.

Fields
model	
string

Optional. The fully qualified name of the publisher model or endpoint to use.

Publisher model format: projects/{project}/locations/{location}/publishers/*/models/*

Endpoint format: projects/{project}/locations/{location}/endpoints/{endpoint}

Union field model_config. Configuration for the LLM. model_config can be only one of the following:
generation_config	
GenerationConfig

Optional. Generation config.

State
The state of the evaluation run.

Enums
STATE_UNSPECIFIED	Unspecified state.
PENDING	The evaluation run is pending.
RUNNING	The evaluation run is running.
SUCCEEDED	The evaluation run has succeeded.
FAILED	The evaluation run has failed.
CANCELLED	The evaluation run has been cancelled.
INFERENCE	The evaluation run is performing inference.
GENERATING_RUBRICS	The evaluation run is performing rubric generation.
EvaluationRunMetric
The metric used for evaluation runs.

Fields
metric	
string

Required. The name of the metric.

metric_config	
Metric

The metric config.

Union field metric_spec. The metric spec used for evaluation. metric_spec can be only one of the following:
rubric_based_metric_spec	
RubricBasedMetricSpec

Spec for rubric based metric.

predefined_metric_spec	
PredefinedMetricSpec

Spec for a pre-defined metric.

llm_based_metric_spec	
LLMBasedMetricSpec

Spec for an LLM based metric.

LLMBasedMetricSpec
Specification for an LLM based metric.

Fields
Union field rubrics_source. Source of the rubrics to be used for evaluation. rubrics_source can be only one of the following:
rubric_group_key	
string

Use a pre-defined group of rubrics associated with the input. Refers to a key in the rubric_groups map of EvaluationInstance.

rubric_generation_spec	
RubricGenerationSpec

Dynamically generate rubrics using this specification.

predefined_rubric_generation_spec	
PredefinedMetricSpec

Dynamically generate rubrics using a predefined spec.

metric_prompt_template	
string

Required. Template for the prompt sent to the judge model.

system_instruction	
string

Optional. System instructions for the judge model.

judge_autorater_config	
AutoraterConfig

Optional. Optional configuration for the judge LLM (Autorater).

additional_config	
Struct

Optional. Optional additional configuration for the metric.

PredefinedMetricSpec
Specification for a pre-defined metric.

Fields
metric_spec_name	
string

Required. The name of a pre-defined metric, such as "instruction_following_v1" or "text_quality_v1".

parameters	
Struct

Optional. The parameters needed to run the pre-defined metric.

RubricBasedMetricSpec
Specification for a metric that is based on rubrics.

Fields
metric_prompt_template	
string

Optional. Template for the prompt used by the judge model to evaluate against rubrics.

Union field rubrics_source. Source of the rubrics to be used for evaluation. rubrics_source can be only one of the following:
inline_rubrics	
RepeatedRubrics

Use rubrics provided directly in the spec.

rubric_group_key	
string

Use a pre-defined group of rubrics associated with the input content. This refers to a key in the rubric_groups map of RubricEnhancedContents.

rubric_generation_spec	
RubricGenerationSpec

Dynamically generate rubrics for evaluation using this specification.

judge_autorater_config	
AutoraterConfig

Optional. Optional configuration for the judge LLM (Autorater). The definition of AutoraterConfig needs to be provided.

RepeatedRubrics
Defines a list of rubrics, used when providing rubrics inline.

Fields
rubrics[]	
Rubric

The list of rubrics.

RubricGenerationSpec
Specification for how rubrics should be generated.

Fields
prompt_template	
string

Optional. Template for the prompt used to generate rubrics. The details should be updated based on the most-recent recipe requirements.

rubric_content_type	
RubricContentType

Optional. The type of rubric content to be generated.

rubric_type_ontology[]	
string

Optional. An optional, pre-defined list of allowed types for generated rubrics. If this field is provided, it implies include_rubric_type should be true, and the generated rubric types should be chosen from this ontology.

model_config	
AutoraterConfig

Optional. Configuration for the model used in rubric generation. Configs including sampling count and base model can be specified here. Flipping is not supported for rubric generation.

RubricContentType
Specifies the type of rubric content to generate.

Enums
RUBRIC_CONTENT_TYPE_UNSPECIFIED	The content type to generate is not specified.
PROPERTY	Generate rubrics based on properties.
NL_QUESTION_ANSWER	Generate rubrics in an NL question answer format.
PYTHON_CODE_ASSERTION	Generate rubrics in a unit test format.
EvaluationSet
EvaluationSet is a collection of related EvaluationItems that are evaluated together.

Fields
name	
string

Identifier. The resource name of the EvaluationSet. Format: projects/{project}/locations/{location}/evaluationSets/{evaluation_set}

display_name	
string

Required. The display name of the EvaluationSet.

evaluation_items[]	
string

Required. The EvaluationItems that are part of this dataset.

create_time	
Timestamp

Output only. Timestamp when this item was created.

update_time	
Timestamp

Output only. Timestamp when this item was last updated.

metadata	
Value

Optional. Metadata for the EvaluationSet.

ExactMatchInput
Input for exact match metric.

Fields
metric_spec	
ExactMatchSpec

Required. Spec for exact match metric.

instances[]	
ExactMatchInstance

Required. Repeated exact match instances.

ExactMatchInstance
Spec for exact match instance.

Fields
prediction	
string

Required. Output of the evaluated model.

reference	
string

Required. Ground truth used to compare against the prediction.

ExactMatchMetricValue
Exact match metric value for an instance.

Fields
score	
float

Output only. Exact match score.

ExactMatchResults
Results for exact match metric.

Fields
exact_match_metric_values[]	
ExactMatchMetricValue

Output only. Exact match metric values.

ExactMatchSpec
This type has no fields.

Spec for exact match metric - returns 1 if prediction and reference exactly matches, otherwise 0.

ExecutableCode
Code generated by the model that is meant to be executed, and the result returned to the model.

Generated when using the [CodeExecution] tool, in which the code will be automatically executed, and a corresponding [CodeExecutionResult] will also be generated.

Fields
language	
Language

Required. Programming language of the code.

code	
string

Required. The code to be executed.

Language
Supported programming languages for the generated code.

Enums
LANGUAGE_UNSPECIFIED	Unspecified language. This value should not be used.
PYTHON	Python >= 3.10, with numpy and simpy available.
ExternalApi
Retrieve from data source powered by external API for grounding. The external API is not owned by Google, but need to follow the pre-defined API spec.

Fields
api_spec	
ApiSpec

The API spec that the external API implements.

endpoint	
string

The endpoint of the external API. The system will call the API at this endpoint to retrieve the data for grounding. Example: https://acme.com:443/search

api_auth
(deprecated)	
ApiAuth

This item is deprecated!

The authentication config to access the API. Deprecated. Please use auth_config instead.

auth_config	
AuthConfig

The authentication config to access the API.

Union field params. Parameters for the API call. This should be matched with the API spec used. params can be only one of the following:
simple_search_params	
SimpleSearchParams

Parameters for the simple search API.

elastic_search_params	
ElasticSearchParams

Parameters for the elastic search API.

ApiSpec
The API spec that the external API implements.

Enums
API_SPEC_UNSPECIFIED	Unspecified API spec. This value should not be used.
SIMPLE_SEARCH	Simple search API spec.
ELASTIC_SEARCH	Elastic search API spec.
ElasticSearchParams
The search parameters to use for the ELASTIC_SEARCH spec.

Fields
index	
string

The ElasticSearch index to use.

search_template	
string

The ElasticSearch search template to use.

num_hits	
int32

Optional. Number of hits (chunks) to request.

When specified, it is passed to Elasticsearch as the num_hits param.

SimpleSearchParams
This type has no fields.

The search parameters to use for SIMPLE_SEARCH spec.

Fact
The fact used in grounding.

Fields
query	
string

Query that is used to retrieve this fact.

title	
string

If present, it refers to the title of this fact.

uri	
string

If present, this uri links to the source of the fact.

summary	
string

If present, the summary/snippet of the fact.

vector_distance
(deprecated)	
double

This item is deprecated!

If present, the distance between the query vector and this fact vector.

score	
double

If present, according to the underlying Vector DB and the selected metric type, the score can be either the distance or the similarity between the query and the fact and its range depends on the metric type.

For example, if the metric type is COSINE_DISTANCE, it represents the distance between the query and the fact. The larger the distance, the less relevant the fact is to the query. The range is [0, 2], while 0 means the most relevant and 2 means the least relevant.

chunk	
RagChunk

If present, chunk properties.

FetchPredictOperationRequest
Request message for PredictionService.FetchPredictOperation.

Fields
endpoint	
string

Required. The name of the Endpoint requested to serve the prediction. Format: projects/{project}/locations/{location}/endpoints/{endpoint} or projects/{project}/locations/{location}/publishers/{publisher}/models/{model}

operation_name	
string

Required. The server-assigned name for the operation.

FileData
URI-based data.

A FileData message contains a URI pointing to data of a specific media type. It is used to represent images, audio, and video stored in Google Cloud Storage.

Fields
mime_type	
string

Required. The IANA standard MIME type of the source data.

file_uri	
string

Required. The URI of the file in Google Cloud Storage.

display_name	
string

Optional. The display name of the file. Used to provide a label or filename to distinguish files.

This field is only returned in PromptMessage for prompt management. It is used in the Gemini calls only when server side tools (code_execution, google_search, and url_context) are enabled.

FileStatus
RagFile status.

Fields
state	
State

Output only. RagFile state.

error_status	
string

Output only. Only when the state field is ERROR.

State
RagFile state.

Enums
STATE_UNSPECIFIED	RagFile state is unspecified.
ACTIVE	RagFile resource has been created and indexed successfully.
ERROR	RagFile resource is in a problematic state. See error_message field for details.
FluencyInput
Input for fluency metric.

Fields
metric_spec	
FluencySpec

Required. Spec for fluency score metric.

instance	
FluencyInstance

Required. Fluency instance.

FluencyInstance
Spec for fluency instance.

Fields
prediction	
string

Required. Output of the evaluated model.

FluencyResult
Spec for fluency result.

Fields
explanation	
string

Output only. Explanation for fluency score.

score	
float

Output only. Fluency score.

confidence	
float

Output only. Confidence for fluency score.

FluencySpec
Spec for fluency score metric.

Fields
version	
int32

Optional. Which version to use for evaluation.

FulfillmentInput
Input for fulfillment metric.

Fields
metric_spec	
FulfillmentSpec

Required. Spec for fulfillment score metric.

instance	
FulfillmentInstance

Required. Fulfillment instance.

FulfillmentInstance
Spec for fulfillment instance.

Fields
prediction	
string

Required. Output of the evaluated model.

instruction	
string

Required. Inference instruction prompt to compare prediction with.

FulfillmentResult
Spec for fulfillment result.

Fields
explanation	
string

Output only. Explanation for fulfillment score.

score	
float

Output only. Fulfillment score.

confidence	
float

Output only. Confidence for fulfillment score.

FulfillmentSpec
Spec for fulfillment metric.

Fields
version	
int32

Optional. Which version to use for evaluation.

FunctionCall
A predicted [FunctionCall] returned from the model that contains a string representing the [FunctionDeclaration.name] and a structured JSON object containing the parameters and their values.

Fields
name	
string

Optional. The name of the function to call. Matches [FunctionDeclaration.name].

args	
Struct

Optional. The function parameters and values in JSON object format. See [FunctionDeclaration.parameters] for parameter details.

partial_args[]	
PartialArg

Optional. The partial argument value of the function call. If provided, represents the arguments/fields that are streamed incrementally.

will_continue	
bool

Optional. Whether this is the last part of the FunctionCall. If true, another partial message for the current FunctionCall is expected to follow.

FunctionCallingConfig
Function calling config.

Fields
mode	
Mode

Optional. Function calling mode.

allowed_function_names[]	
string

Optional. Function names to call. Only set when the Mode is ANY. Function names should match [FunctionDeclaration.name]. With mode set to ANY, model will predict a function call from the set of function names provided.

stream_function_call_arguments	
bool

Optional. When set to true, arguments of a single function call will be streamed out in multiple parts/contents/responses. Partial parameter results will be returned in the [FunctionCall.partial_args] field.

Mode
Function calling mode.

Enums
MODE_UNSPECIFIED	Unspecified function calling mode. This value should not be used.
AUTO	Default model behavior, model decides to predict either function calls or natural language response.
ANY	Model is constrained to always predicting function calls only. If "allowed_function_names" are set, the predicted function calls will be limited to any one of "allowed_function_names", else the predicted function calls will be any one of the provided "function_declarations".
NONE	Model will not predict any function calls. Model behavior is same as when not passing any function declarations.
FunctionDeclaration
Structured representation of a function declaration as defined by the OpenAPI 3.0 specification. Included in this declaration are the function name, description, parameters and response type. This FunctionDeclaration is a representation of a block of code that can be used as a Tool by the model and executed by the client.

Fields
name	
string

Required. The name of the function to call. Must start with a letter or an underscore. Must be a-z, A-Z, 0-9, or contain underscores, dots, colons and dashes, with a maximum length of 64.

description	
string

Optional. Description and purpose of the function. Model uses it to decide how and whether to call the function.

parameters	
Schema

Optional. Describes the parameters to this function in JSON Schema Object format. Reflects the Open API 3.03 Parameter Object. string Key: the name of the parameter. Parameter names are case sensitive. Schema Value: the Schema defining the type used for the parameter. For function with no parameters, this can be left unset. Parameter names must start with a letter or an underscore and must only contain chars a-z, A-Z, 0-9, or underscores with a maximum length of 64. Example with 1 required and 1 optional parameter: type: OBJECT properties: param1: type: STRING param2: type: INTEGER required: - param1

parameters_json_schema	
Value

Optional. Describes the parameters to the function in JSON Schema format. The schema must describe an object where the properties are the parameters to the function. For example:

{
  "type": "object",
  "properties": {
    "name": { "type": "string" },
    "age": { "type": "integer" }
  },
  "additionalProperties": false,
  "required": ["name", "age"],
  "propertyOrdering": ["name", "age"]
}
This field is mutually exclusive with parameters.

response	
Schema

Optional. Describes the output from this function in JSON Schema format. Reflects the Open API 3.03 Response Object. The Schema defines the type used for the response value of the function.

response_json_schema	
Value

Optional. Describes the output from this function in JSON Schema format. The value specified by the schema is the response value of the function.

This field is mutually exclusive with response.

FunctionResponse
The result output from a [FunctionCall] that contains a string representing the [FunctionDeclaration.name] and a structured JSON object containing any output from the function is used as context to the model. This should contain the result of a [FunctionCall] made based on model prediction.

Fields
name	
string

Required. The name of the function to call. Matches [FunctionDeclaration.name] and [FunctionCall.name].

response	
Struct

Required. The function response in JSON object format. Use "output" key to specify function output and "error" key to specify error details (if any). If "output" and "error" keys are not specified, then whole "response" is treated as function output.

parts[]	
FunctionResponsePart

Optional. Ordered Parts that constitute a function response. Parts may have different IANA MIME types.

FunctionResponseBlob
Raw media bytes for function response.

Text should not be sent as raw bytes, use the 'text' field.

Fields
mime_type	
string

Required. The IANA standard MIME type of the source data.

data	
bytes

Required. Raw bytes.

display_name	
string

Optional. Display name of the blob.

Used to provide a label or filename to distinguish blobs.

This field is only returned in PromptMessage for prompt management. It is currently used in the Gemini GenerateContent calls only when server side tools (code_execution, google_search, and url_context) are enabled.

FunctionResponseFileData
URI based data for function response.

Fields
mime_type	
string

Required. The IANA standard MIME type of the source data.

file_uri	
string

Required. URI.

display_name	
string

Optional. Display name of the file data.

Used to provide a label or filename to distinguish file datas.

This field is only returned in PromptMessage for prompt management. It is currently used in the Gemini GenerateContent calls only when server side tools (code_execution, google_search, and url_context) are enabled.

FunctionResponsePart
A datatype containing media that is part of a FunctionResponse message.

A FunctionResponsePart consists of data which has an associated datatype. A FunctionResponsePart can only contain one of the accepted types in FunctionResponsePart.data.

A FunctionResponsePart must have a fixed IANA MIME type identifying the type and subtype of the media if the inline_data field is filled with raw bytes.

Fields
Union field data. The data of the function response part. data can be only one of the following:
inline_data	
FunctionResponseBlob

Inline media bytes.

file_data	
FunctionResponseFileData

URI based data.

GcsDestination
The Google Cloud Storage location where the output is to be written to.

Fields
output_uri_prefix	
string

Required. Google Cloud Storage URI to output directory. If the uri doesn't end with '/', a '/' will be automatically appended. The directory is created if it doesn't exist.

GcsSource
The Google Cloud Storage location for the input content.

Fields
uris[]	
string

Required. Google Cloud Storage URI(-s) to the input file(s). May contain wildcards. For more information on wildcards, see https://cloud.google.com/storage/docs/wildcards.

GeminiPreferenceExample
Input example for preference optimization.

Fields
contents[]	
Content

Multi-turn contents that represents the Prompt.

completions[]	
Completion

List of completions for a given prompt.

Completion
Completion and its preference score.

Fields
completion	
Content

Single turn completion for the given prompt.

score	
float

The score for the given completion.

GenerateContentRequest
Request message for [PredictionService.GenerateContent].

Fields
model	
string

Required. The fully qualified name of the publisher model or tuned model endpoint to use.

Publisher model format: projects/{project}/locations/{location}/publishers/*/models/*

Tuned model endpoint format: projects/{project}/locations/{location}/endpoints/{endpoint}

contents[]	
Content

Required. The content of the current conversation with the model.

For single-turn queries, this is a single instance. For multi-turn queries, this is a repeated field that contains conversation history + latest request.

cached_content	
string

Optional. The name of the cached content used as context to serve the prediction. Note: only used in explicit caching, where users can have control over caching (e.g. what content to cache) and enjoy guaranteed cost savings. Format: projects/{project}/locations/{location}/cachedContents/{cachedContent}

tools[]	
Tool

Optional. A list of Tools the model may use to generate the next response.

A Tool is a piece of code that enables the system to interact with external systems to perform an action, or set of actions, outside of knowledge and scope of the model.

tool_config	
ToolConfig

Optional. Tool config. This config is shared for all tools provided in the request.

labels	
map<string, string>

Optional. The labels with user-defined metadata for the request. It is used for billing and reporting only.

Label keys and values can be no longer than 63 characters (Unicode codepoints) and can only contain lowercase letters, numeric characters, underscores, and dashes. International characters are allowed. Label values are optional. Label keys must start with a letter.

safety_settings[]	
SafetySetting

Optional. Per request settings for blocking unsafe content. Enforced on GenerateContentResponse.candidates.

model_armor_config	
ModelArmorConfig

Optional. Settings for prompt and response sanitization using the Model Armor service. If supplied, safety_settings must not be supplied.

generation_config	
GenerationConfig

Optional. Generation config.

system_instruction	
Content

Optional. The user provided system instructions for the model. Note: only text should be used in parts and content in each part will be in a separate paragraph.

GenerateContentResponse
Response message for [PredictionService.GenerateContent].

Fields
candidates[]	
Candidate

Output only. Generated candidates.

model_version	
string

Output only. The model version used to generate the response.

create_time	
Timestamp

Output only. Timestamp when the request is made to the server.

response_id	
string

Output only. response_id is used to identify each response. It is the encoding of the event_id.

prompt_feedback	
PromptFeedback

Output only. Content filter results for a prompt sent in the request. Note: Sent only in the first stream chunk. Only happens when no candidates were generated due to content violations.

usage_metadata	
UsageMetadata

Usage metadata about the response(s).

PromptFeedback
Content filter results for a prompt sent in the request. Note: This is sent only in the first stream chunk and only if no candidates were generated due to content violations.

Fields
block_reason	
BlockedReason

Output only. The reason why the prompt was blocked.

safety_ratings[]	
SafetyRating

Output only. A list of safety ratings for the prompt. There is one rating per category.

block_reason_message	
string

Output only. A readable message that explains the reason why the prompt was blocked.

BlockedReason
The reason why the prompt was blocked.

Enums
BLOCKED_REASON_UNSPECIFIED	The blocked reason is unspecified.
SAFETY	The prompt was blocked for safety reasons.
OTHER	The prompt was blocked for other reasons. For example, it may be due to the prompt's language, or because it contains other harmful content.
BLOCKLIST	The prompt was blocked because it contains a term from the terminology blocklist.
PROHIBITED_CONTENT	The prompt was blocked because it contains prohibited content.
MODEL_ARMOR	The prompt was blocked by Model Armor.
IMAGE_SAFETY	The prompt was blocked because it contains content that is unsafe for image generation.
JAILBREAK	The prompt was blocked as a jailbreak attempt.
UsageMetadata
Usage metadata about the content generation request and response. This message provides a detailed breakdown of token usage and other relevant metrics.

Fields
prompt_token_count	
int32

The total number of tokens in the prompt. This includes any text, images, or other media provided in the request. When cached_content is set, this also includes the number of tokens in the cached content.

candidates_token_count	
int32

The total number of tokens in the generated candidates.

total_token_count	
int32

The total number of tokens for the entire request. This is the sum of prompt_token_count, candidates_token_count, tool_use_prompt_token_count, and thoughts_token_count.

tool_use_prompt_token_count	
int32

Output only. The number of tokens in the results from tool executions, which are provided back to the model as input, if applicable.

thoughts_token_count	
int32

Output only. The number of tokens that were part of the model's generated "thoughts" output, if applicable.

cached_content_token_count	
int32

Output only. The number of tokens in the cached content that was used for this request.

prompt_tokens_details[]	
ModalityTokenCount

Output only. A detailed breakdown of the token count for each modality in the prompt.

cache_tokens_details[]	
ModalityTokenCount

Output only. A detailed breakdown of the token count for each modality in the cached content.

candidates_tokens_details[]	
ModalityTokenCount

Output only. A detailed breakdown of the token count for each modality in the generated candidates.

tool_use_prompt_tokens_details[]	
ModalityTokenCount

Output only. A detailed breakdown by modality of the token counts from the results of tool executions, which are provided back to the model as input.

traffic_type	
TrafficType

Output only. The traffic type for this request.

TrafficType
The type of traffic that this request was processed with, indicating which quota is consumed.

Enums
TRAFFIC_TYPE_UNSPECIFIED	Unspecified request traffic type.
ON_DEMAND	The request was processed using Pay-As-You-Go quota.
PROVISIONED_THROUGHPUT	Type for Provisioned Throughput traffic.
GenerateInstanceRubricsRequest
Request message for EvaluationService.GenerateInstanceRubrics.

Fields
location	
string

Required. The resource name of the Location to generate rubrics from. Format: projects/{project}/locations/{location}

contents[]	
Content

Required. The prompt to generate rubrics from. For single-turn queries, this is a single instance. For multi-turn queries, this is a repeated field that contains conversation history + latest request.

predefined_rubric_generation_spec	
PredefinedMetricSpec

Optional. Specification for using the rubric generation configs of a pre-defined metric, e.g. "generic_quality_v1" and "instruction_following_v1". Some of the configs may be only used in rubric generation and not supporting evaluation, e.g. "fully_customized_generic_quality_v1". If this field is set, the rubric_generation_spec field will be ignored.

rubric_generation_spec	
RubricGenerationSpec

Optional. Specification for how the rubrics should be generated.

agent_config	
AgentConfig

Optional. Agent configuration, required for agent-based rubric generation.

GenerateInstanceRubricsResponse
Response message for EvaluationService.GenerateInstanceRubrics.

Fields
generated_rubrics[]	
Rubric

Output only. A list of generated rubrics.

GenerateSyntheticDataRequest
Request message for DataFoundryService.GenerateSyntheticData.

Fields
location	
string

Required. The resource name of the Location to run the job. Format: projects/{project}/locations/{location}

count	
int32

Required. The number of synthetic examples to generate. For this stateless API, the count is limited to a small number.

output_field_specs[]	
OutputFieldSpec

Required. The schema of the desired output, defined by a list of fields.

examples[]	
SyntheticExample

Optional. A list of few-shot examples to guide the model's output style and format.

Union field strategy. The generation strategy to use. strategy can be only one of the following:
task_description	
TaskDescriptionStrategy

Generate data from a high-level task description.

GenerateSyntheticDataResponse
The response containing the generated data.

Fields
synthetic_examples[]	
SyntheticExample

A list of generated synthetic examples.

GenerationConfig
Configuration for content generation.

This message contains all the parameters that control how the model generates content. It allows you to influence the randomness, length, and structure of the output.

Fields
stop_sequences[]	
string

Optional. A list of character sequences that will stop the model from generating further tokens. If a stop sequence is generated, the output will end at that point. This is useful for controlling the length and structure of the output. For example, you can use ["\n", "###"] to stop generation at a new line or a specific marker.

response_mime_type	
string

Optional. The IANA standard MIME type of the response. The model will generate output that conforms to this MIME type. Supported values include 'text/plain' (default) and 'application/json'. The model needs to be prompted to output the appropriate response type, otherwise the behavior is undefined. This is a preview feature.

response_modalities[]	
Modality

Optional. The modalities of the response. The model will generate a response that includes all the specified modalities. For example, if this is set to [TEXT, IMAGE], the response will include both text and an image.

thinking_config	
ThinkingConfig

Optional. Configuration for thinking features. An error will be returned if this field is set for models that don't support thinking.

temperature	
float

Optional. Controls the randomness of the output. A higher temperature results in more creative and diverse responses, while a lower temperature makes the output more predictable and focused. The valid range is (0.0, 2.0].

top_p	
float

Optional. Specifies the nucleus sampling threshold. The model considers only the smallest set of tokens whose cumulative probability is at least top_p. This helps generate more diverse and less repetitive responses. For example, a top_p of 0.9 means the model considers tokens until the cumulative probability of the tokens to select from reaches 0.9. It's recommended to adjust either temperature or top_p, but not both.

top_k	
float

Optional. Specifies the top-k sampling threshold. The model considers only the top k most probable tokens for the next token. This can be useful for generating more coherent and less random text. For example, a top_k of 40 means the model will choose the next word from the 40 most likely words.

candidate_count	
int32

Optional. The number of candidate responses to generate.

A higher candidate_count can provide more options to choose from, but it also consumes more resources. This can be useful for generating a variety of responses and selecting the best one.

max_output_tokens	
int32

Optional. The maximum number of tokens to generate in the response.

A token is approximately four characters. The default value varies by model. This parameter can be used to control the length of the generated text and prevent overly long responses.

response_logprobs	
bool

Optional. If set to true, the log probabilities of the output tokens are returned.

Log probabilities are the logarithm of the probability of a token appearing in the output. A higher log probability means the token is more likely to be generated. This can be useful for analyzing the model's confidence in its own output and for debugging.

logprobs	
int32

Optional. The number of top log probabilities to return for each token.

This can be used to see which other tokens were considered likely candidates for a given position. A higher value will return more options, but it will also increase the size of the response.

presence_penalty	
float

Optional. Penalizes tokens that have already appeared in the generated text. A positive value encourages the model to generate more diverse and less repetitive text. Valid values can range from [-2.0, 2.0].

frequency_penalty	
float

Optional. Penalizes tokens based on their frequency in the generated text. A positive value helps to reduce the repetition of words and phrases. Valid values can range from [-2.0, 2.0].

seed	
int32

Optional. A seed for the random number generator.

By setting a seed, you can make the model's output mostly deterministic. For a given prompt and parameters (like temperature, top_p, etc.), the model will produce the same response every time. However, it's not a guaranteed absolute deterministic behavior. This is different from parameters like temperature, which control the level of randomness. seed ensures that the "random" choices the model makes are the same on every run, making it essential for testing and ensuring reproducible results.

response_schema	
Schema

Optional. Lets you to specify a schema for the model's response, ensuring that the output conforms to a particular structure. This is useful for generating structured data such as JSON. The schema is a subset of the OpenAPI 3.0 schema object object.

When this field is set, you must also set the response_mime_type to application/json.

response_json_schema	
Value

Optional. When this field is set, response_schema must be omitted and response_mime_type must be set to application/json.

routing_config	
RoutingConfig

Optional. Routing configuration.

audio_timestamp	
bool

Optional. If enabled, audio timestamps will be included in the request to the model. This can be useful for synchronizing audio with other modalities in the response.

media_resolution	
MediaResolution

Optional. The token resolution at which input media content is sampled. This is used to control the trade-off between the quality of the response and the number of tokens used to represent the media. A higher resolution allows the model to perceive more detail, which can lead to a more nuanced response, but it will also use more tokens. This does not affect the image dimensions sent to the model.

speech_config	
SpeechConfig

Optional. The speech generation config.

enable_affective_dialog	
bool

Optional. If enabled, the model will detect emotions and adapt its responses accordingly. For example, if the model detects that the user is frustrated, it may provide a more empathetic response.

image_config	
ImageConfig

Optional. Config for image generation features.

MediaResolution
Media resolution for the input media.

Enums
MEDIA_RESOLUTION_UNSPECIFIED	Media resolution has not been set.
MEDIA_RESOLUTION_LOW	Media resolution set to low (64 tokens).
MEDIA_RESOLUTION_MEDIUM	Media resolution set to medium (256 tokens).
MEDIA_RESOLUTION_HIGH	Media resolution set to high (zoomed reframing with 256 tokens).
Modality
The modalities of the response.

Enums
MODALITY_UNSPECIFIED	Unspecified modality. Will be processed as text.
TEXT	Text modality.
IMAGE	Image modality.
AUDIO	Audio modality.
RoutingConfig
The configuration for routing the request to a specific model. This can be used to control which model is used for the generation, either automatically or by specifying a model name.

Fields
Union field routing_config. The routing mode for the request. routing_config can be only one of the following:
auto_mode	
AutoRoutingMode

In this mode, the model is selected automatically based on the content of the request.

manual_mode	
ManualRoutingMode

In this mode, the model is specified manually.

AutoRoutingMode
The configuration for automated routing.

When automated routing is specified, the routing will be determined by the pretrained routing model and customer provided model routing preference.

Fields
model_routing_preference	
ModelRoutingPreference

The model routing preference.

ModelRoutingPreference
The model routing preference.

Enums
UNKNOWN	Unspecified model routing preference.
PRIORITIZE_QUALITY	The model will be selected to prioritize the quality of the response.
BALANCED	The model will be selected to balance quality and cost.
PRIORITIZE_COST	The model will be selected to prioritize the cost of the request.
ManualRoutingMode
The configuration for manual routing.

When manual routing is specified, the model will be selected based on the model name provided.

Fields
model_name	
string

The name of the model to use. Only public LLM models are accepted.

ThinkingConfig
Configuration for the model's thinking features.

"Thinking" is a process where the model breaks down a complex task into smaller, manageable steps. This allows the model to reason about the task, plan its approach, and execute the plan to generate a high-quality response.

Fields
include_thoughts	
bool

Optional. If true, the model will include its thoughts in the response. "Thoughts" are the intermediate steps the model takes to arrive at the final response. They can provide insights into the model's reasoning process and help with debugging. If this is true, thoughts are returned only when available.

thinking_budget	
int32

Optional. The token budget for the model's thinking process. The model will make a best effort to stay within this budget. This can be used to control the trade-off between response quality and latency.

thinking_level	
ThinkingLevel

Optional. The number of thoughts tokens that the model should generate.

ThinkingLevel
The thinking level for the model.

Enums
THINKING_LEVEL_UNSPECIFIED	Unspecified thinking level.
LOW	Low thinking level.
HIGH	High thinking level.
GenericOperationMetadata
Generic Metadata shared by all operations.

Fields
partial_failures[]	
Status

Output only. Partial failures encountered. E.g. single files that couldn't be read. This field should never exceed 20 entries. Status details field will contain standard Google Cloud error details.

create_time	
Timestamp

Output only. Time when the operation was created.

update_time	
Timestamp

Output only. Time when the operation was updated for the last time. If the operation has finished (successfully or not), this is the finish time.

GetCacheConfigRequest
Request message for getting a cache config.

Fields
name	
string

Required. Name of the cache config. Format: - projects/{project}/cacheConfig.

GetCachedContentRequest
Request message for GenAiCacheService.GetCachedContent.

Fields
name	
string

Required. The resource name referring to the cached content

GetEvaluationItemRequest
Request message for EvaluationManagementService.GetEvaluationItem.

Fields
name	
string

Required. The name of the EvaluationItem resource. Format: projects/{project}/locations/{location}/evaluationItems/{evaluation_item}

GetEvaluationRunRequest
Request message for EvaluationManagementService.GetEvaluationRun.

Fields
name	
string

Required. The name of the EvaluationRun resource. Format: projects/{project}/locations/{location}/evaluationRuns/{evaluation_run}

GetEvaluationSetRequest
Request message for EvaluationManagementService.GetEvaluationSet.

Fields
name	
string

Required. The name of the EvaluationSet resource. Format: projects/{project}/locations/{location}/evaluationSets/{evaluation_set}

GetRagCorpusRequest
Request message for VertexRagDataService.GetRagCorpus

Fields
name	
string

Required. The name of the RagCorpus resource. Format: projects/{project}/locations/{location}/ragCorpora/{rag_corpus}

GetRagEngineConfigRequest
Request message for VertexRagDataService.GetRagEngineConfig

Fields
name	
string

Required. The name of the RagEngineConfig resource. Format: projects/{project}/locations/{location}/ragEngineConfig

GetRagFileRequest
Request message for VertexRagDataService.GetRagFile

Fields
name	
string

Required. The name of the RagFile resource. Format: projects/{project}/locations/{location}/ragCorpora/{rag_corpus}/ragFiles/{rag_file}

GetReasoningEngineRequest
Request message for ReasoningEngineService.GetReasoningEngine.

Fields
name	
string

Required. The name of the ReasoningEngine resource. Format: projects/{project}/locations/{location}/reasoningEngines/{reasoning_engine}

GetTuningJobRequest
Request message for GenAiTuningService.GetTuningJob.

Fields
name	
string

Required. The name of the TuningJob resource. Format: projects/{project}/locations/{location}/tuningJobs/{tuning_job}

GoAway
Server will not be able to service client soon.

Fields
time_left	
Duration

The remaining time before the connection will be terminated as ABORTED. The minimal time returned here is specified differently together with the rate limits for a given model.

GoogleDriveSource
The Google Drive location for the input content.

Fields
resource_ids[]	
ResourceId

Required. Google Drive resource IDs.

ResourceId
The type and ID of the Google Drive resource.

Fields
resource_type	
ResourceType

Required. The type of the Google Drive resource.

resource_id	
string

Required. The ID of the Google Drive resource.

ResourceType
The type of the Google Drive resource.

Enums
RESOURCE_TYPE_UNSPECIFIED	Unspecified resource type.
RESOURCE_TYPE_FILE	File resource type.
RESOURCE_TYPE_FOLDER	Folder resource type.
GoogleMaps
Tool to retrieve public maps data for grounding, powered by Google.

Fields
enable_widget	
bool

Optional. If true, include the widget context token in the response.

GoogleSearchRetrieval
Tool to retrieve public web data for grounding, powered by Google.

Fields
dynamic_retrieval_config	
DynamicRetrievalConfig

Specifies the dynamic retrieval configuration for the given source.

GroundednessInput
Input for groundedness metric.

Fields
metric_spec	
GroundednessSpec

Required. Spec for groundedness metric.

instance	
GroundednessInstance

Required. Groundedness instance.

GroundednessInstance
Spec for groundedness instance.

Fields
prediction	
string

Required. Output of the evaluated model.

context	
string

Required. Background information provided in context used to compare against the prediction.

GroundednessResult
Spec for groundedness result.

Fields
explanation	
string

Output only. Explanation for groundedness score.

score	
float

Output only. Groundedness score.

confidence	
float

Output only. Confidence for groundedness score.

GroundednessSpec
Spec for groundedness metric.

Fields
version	
int32

Optional. Which version to use for evaluation.

GroundingChunk
A piece of evidence that supports a claim made by the model.

This is used to show a citation for a claim made by the model. When grounding is enabled, the model returns a GroundingChunk that contains a reference to the source of the information.

Fields
Union field chunk_type. The source of the grounding chunk, which can be from Google Search, Vertex AI Search, or Google Maps. chunk_type can be only one of the following:
web	
Web

A grounding chunk from a web page, typically from Google Search. See the Web message for details.

retrieved_context	
RetrievedContext

A grounding chunk from a data source retrieved by a retrieval tool, such as Vertex AI Search. See the RetrievedContext message for details

maps	
Maps

A grounding chunk from Google Maps. See the Maps message for details.

Maps
A Maps chunk is a piece of evidence that comes from Google Maps. It contains information about a place, such as its name, address, and reviews. This is used to provide the user with rich, location-based information.

Fields
place_answer_sources	
PlaceAnswerSources

The sources that were used to generate the place answer. This includes review snippets and photos that were used to generate the answer, as well as URIs to flag content.

uri	
string

The URI of the place.

title	
string

The title of the place.

text	
string

The text of the place answer.

place_id	
string

This Place's resource name, in places/{place_id} format. This can be used to look up the place in the Google Maps API.

PlaceAnswerSources
The sources that were used to generate the place answer. This includes review snippets and photos that were used to generate the answer, as well as URIs to flag content.

Fields
review_snippets[]	
ReviewSnippet

Snippets of reviews that were used to generate the answer.

ReviewSnippet
A review snippet that is used to generate the answer.

Fields
review_id	
string

The ID of the review that is being referenced.

google_maps_uri	
string

A link to show the review on Google Maps.

title	
string

The title of the review.

RetrievedContext
Context retrieved from a data source to ground the model's response. This is used when a retrieval tool fetches information from a user-provided corpus or a public dataset.

Fields
Union field context_details. Provides tool-specific details about the retrieved context. This allows for different types of retrieval tools to return their own specific metadata. context_details can be only one of the following:
rag_chunk	
RagChunk

Additional context for a Retrieval-Augmented Generation (RAG) retrieval result. This is populated only when the RAG retrieval tool is used.

uri	
string

The URI of the retrieved data source.

title	
string

The title of the retrieved data source.

text	
string

The content of the retrieved data source.

document_name	
string

Output only. The full resource name of the referenced Vertex AI Search document. This is used to identify the specific document that was retrieved. The format is projects/{project}/locations/{location}/collections/{collection}/dataStores/{data_store}/branches/{branch}/documents/{document}.

Web
A Web chunk is a piece of evidence that comes from a web page. It contains the URI of the web page, the title of the page, and the domain of the page. This is used to provide the user with a link to the source of the information.

Fields
uri	
string

The URI of the web page that contains the evidence.

title	
string

The title of the web page that contains the evidence.

domain	
string

The domain of the web page that contains the evidence. This can be used to filter out low-quality sources.

GroundingMetadata
Information about the sources that support the content of a response.

When grounding is enabled, the model returns citations for claims in the response. This object contains the retrieved sources.

Fields
web_search_queries[]	
string

Optional. The web search queries that were used to generate the content. This field is populated only when the grounding source is Google Search.

grounding_chunks[]	
GroundingChunk

A list of supporting references retrieved from the grounding source. This field is populated when the grounding source is Google Search, Vertex AI Search, or Google Maps.

grounding_supports[]	
GroundingSupport

Optional. A list of grounding supports that connect the generated content to the grounding chunks. This field is populated when the grounding source is Google Search or Vertex AI Search.

source_flagging_uris[]	
SourceFlaggingUri

Optional. Output only. A list of URIs that can be used to flag a place or review for inappropriate content. This field is populated only when the grounding source is Google Maps.

search_entry_point	
SearchEntryPoint

Optional. A web search entry point that can be used to display search results. This field is populated only when the grounding source is Google Search.

retrieval_metadata	
RetrievalMetadata

Optional. Output only. Metadata related to the retrieval grounding source.

google_maps_widget_context_token	
string

Optional. Output only. A token that can be used to render a Google Maps widget with the contextual data. This field is populated only when the grounding source is Google Maps.

SourceFlaggingUri
A URI that can be used to flag a place or review for inappropriate content. This is populated only when the grounding source is Google Maps.

Fields
source_id	
string

The ID of the place or review.

flag_content_uri	
string

The URI that can be used to flag the content.

GroundingSupport
A collection of supporting references for a segment of the model's response.

Fields
grounding_chunk_indices[]	
int32

A list of indices into the grounding_chunks field of the GroundingMetadata message. These indices specify which grounding chunks support the claim made in the content segment.

For example, if this field has the values [1, 3], it means that grounding_chunks[1] and grounding_chunks[3] are the sources for the claim in the content segment.

confidence_scores[]	
float

The confidence scores for the support references. This list is parallel to the grounding_chunk_indices list. A score is a value between 0.0 and 1.0, with a higher score indicating a higher confidence that the reference supports the claim.

For Gemini 2.0 and before, this list has the same size as grounding_chunk_indices. For Gemini 2.5 and later, this list is empty and should be ignored.

segment	
Segment

The content segment that this support message applies to.

HarmCategory
Harm categories that can be detected in user input and model responses.

Enums
HARM_CATEGORY_UNSPECIFIED	Default value. This value is unused.
HARM_CATEGORY_HATE_SPEECH	Content that promotes violence or incites hatred against individuals or groups based on certain attributes.
HARM_CATEGORY_DANGEROUS_CONTENT	Content that promotes, facilitates, or enables dangerous activities.
HARM_CATEGORY_HARASSMENT	Abusive, threatening, or content intended to bully, torment, or ridicule.
HARM_CATEGORY_SEXUALLY_EXPLICIT	Content that contains sexually explicit material.
HARM_CATEGORY_CIVIC_INTEGRITY	
Deprecated: Election filter is not longer supported. The harm category is civic integrity.

This item is deprecated!

HARM_CATEGORY_IMAGE_HATE	Images that contain hate speech.
HARM_CATEGORY_IMAGE_DANGEROUS_CONTENT	Images that contain dangerous content.
HARM_CATEGORY_IMAGE_HARASSMENT	Images that contain harassment.
HARM_CATEGORY_IMAGE_SEXUALLY_EXPLICIT	Images that contain sexually explicit content.
HARM_CATEGORY_JAILBREAK	Prompts designed to bypass safety filters.
HttpElementLocation
Enum of location an HTTP element can be.

Enums
HTTP_IN_UNSPECIFIED	
HTTP_IN_QUERY	Element is in the HTTP request query.
HTTP_IN_HEADER	Element is in the HTTP request header.
HTTP_IN_PATH	Element is in the HTTP request path.
HTTP_IN_BODY	Element is in the HTTP request body.
HTTP_IN_COOKIE	Element is in the HTTP request cookie.
ImageConfig
Configuration for image generation.

This message allows you to control various aspects of image generation, such as the output format, aspect ratio, and whether the model can generate images of people.

Fields
image_output_options	
ImageOutputOptions

Optional. The image output format for generated images.

aspect_ratio	
string

Optional. The desired aspect ratio for the generated images. The following aspect ratios are supported:

"1:1" "2:3", "3:2" "3:4", "4:3" "4:5", "5:4" "9:16", "16:9" "21:9"

person_generation	
PersonGeneration

Optional. Controls whether the model can generate people.

image_size	
string

Optional. Specifies the size of generated images. Supported values are 1K, 2K, 4K. If not specified, the model will use default value 1K.

ImageOutputOptions
The image output format for generated images.

Fields
mime_type	
string

Optional. The image format that the output should be saved as.

compression_quality	
int32

Optional. The compression quality of the output image.

PersonGeneration
Enum for controlling the generation of people in images.

Enums
PERSON_GENERATION_UNSPECIFIED	The default behavior is unspecified. The model will decide whether to generate images of people.
ALLOW_ALL	Allows the model to generate images of people, including adults and children.
ALLOW_ADULT	Allows the model to generate images of adults, but not children.
ALLOW_NONE	Prevents the model from generating images of people.
ImportRagFilesConfig
Config for importing RagFiles.

Fields
rag_file_transformation_config	
RagFileTransformationConfig

Specifies the transformation config for RagFiles.

rag_file_parsing_config	
RagFileParsingConfig

Optional. Specifies the parsing config for RagFiles. RAG will use the default parser if this field is not set.

max_embedding_requests_per_min	
int32

Optional. The max number of queries per minute that this job is allowed to make to the embedding model specified on the corpus. This value is specific to this job and not shared across other import jobs. Consult the Quotas page on the project to set an appropriate value here. If unspecified, a default value of 1,000 QPM would be used.

rebuild_ann_index	
bool

Rebuilds the ANN index to optimize for recall on the imported data. Only applicable for RagCorpora running on RagManagedDb with retrieval_strategy set to ANN. The rebuild will be performed using the existing ANN config set on the RagCorpus. To change the ANN config, please use the UpdateRagCorpus API.

Default is false, i.e., index is not rebuilt.

Union field import_source. The source of the import. import_source can be only one of the following:
gcs_source	
GcsSource

Google Cloud Storage location. Supports importing individual files as well as entire Google Cloud Storage directories. Sample formats: - gs://bucket_name/my_directory/object_name/my_file.txt - gs://bucket_name/my_directory

google_drive_source	
GoogleDriveSource

Google Drive location. Supports importing individual files as well as Google Drive folders.

slack_source	
SlackSource

Slack channels with their corresponding access tokens.

jira_source	
JiraSource

Jira queries with their corresponding authentication.

share_point_sources	
SharePointSources

SharePoint sources.

Union field partial_failure_sink. Optional. If provided, all partial failures are written to the sink. Deprecated. Prefer to use the import_result_sink. partial_failure_sink can be only one of the following:
partial_failure_gcs_sink
(deprecated)	
GcsDestination

This item is deprecated!

The Cloud Storage path to write partial failures to. Deprecated. Prefer to use import_result_gcs_sink.

partial_failure_bigquery_sink
(deprecated)	
BigQueryDestination

This item is deprecated!

The BigQuery destination to write partial failures to. It should be a bigquery table resource name (e.g. "bq://projectId.bqDatasetId.bqTableId"). The dataset must exist. If the table does not exist, it will be created with the expected schema. If the table exists, the schema will be validated and data will be added to this existing table. Deprecated. Prefer to use import_result_bq_sink.

Union field import_result_sink. Optional. If provided, all successfully imported files and all partial failures are written to the sink. import_result_sink can be only one of the following:
import_result_gcs_sink	
GcsDestination

The Cloud Storage path to write import result to.

import_result_bigquery_sink	
BigQueryDestination

The BigQuery destination to write import result to. It should be a bigquery table resource name (e.g. "bq://projectId.bqDatasetId.bqTableId"). The dataset must exist. If the table does not exist, it will be created with the expected schema. If the table exists, the schema will be validated and data will be added to this existing table.

ImportRagFilesOperationMetadata
Runtime operation information for VertexRagDataService.ImportRagFiles.

Fields
generic_metadata	
GenericOperationMetadata

The operation generic information.

rag_corpus_id	
int64

The resource ID of RagCorpus that this operation is executed on.

import_rag_files_config	
ImportRagFilesConfig

Output only. The config that was passed in the ImportRagFilesRequest.

progress_percentage	
int32

The progress percentage of the operation. Value is in the range [0, 100]. This percentage is calculated as follows: progress_percentage = 100 * (successes + failures + skips) / total

ImportRagFilesRequest
Request message for VertexRagDataService.ImportRagFiles.

Fields
parent	
string

Required. The name of the RagCorpus resource into which to import files. Format: projects/{project}/locations/{location}/ragCorpora/{rag_corpus}

import_rag_files_config	
ImportRagFilesConfig

Required. The config for the RagFiles to be synced and imported into the RagCorpus. VertexRagDataService.ImportRagFiles.

ImportRagFilesResponse
Response message for VertexRagDataService.ImportRagFiles.

Fields
imported_rag_files_count	
int64

The number of RagFiles that had been imported into the RagCorpus.

failed_rag_files_count	
int64

The number of RagFiles that had failed while importing into the RagCorpus.

skipped_rag_files_count	
int64

The number of RagFiles that was skipped while importing into the RagCorpus.

Union field partial_failure_sink. The location into which the partial failures were written. partial_failure_sink can be only one of the following:
partial_failures_gcs_path	
string

The Google Cloud Storage path into which the partial failures were written.

partial_failures_bigquery_table	
string

The BigQuery table into which the partial failures were written.

InvokeRequest
Request message for PredictionService.Invoke.

Fields
endpoint	
string

Required. The name of the Endpoint requested to serve the prediction. Format: projects/{project}/locations/{location}/endpoints/{endpoint}

deployed_model_id	
string

ID of the DeployedModel that serves the invoke request.

http_body	
HttpBody

The invoke method input. Supports HTTP headers and arbitrary data payload.

JiraSource
The Jira source for the ImportRagFilesRequest.

Fields
jira_queries[]	
JiraQueries

Required. The Jira queries.

JiraQueries
JiraQueries contains the Jira queries and corresponding authentication.

Fields
projects[]	
string

A list of Jira projects to import in their entirety.

custom_queries[]	
string

A list of custom Jira queries to import. For information about JQL (Jira Query Language), see https://support.atlassian.com/jira-service-management-cloud/docs/use-advanced-search-with-jira-query-language-jql/

email	
string

Required. The Jira email address.

server_uri	
string

Required. The Jira server URI.

api_key_config	
ApiKeyConfig

Required. The SecretManager secret version resource name (e.g. projects/{project}/secrets/{secret}/versions/{version}) storing the Jira API key. See Manage API tokens for your Atlassian account.

JobState
Describes the state of a job.

Enums
JOB_STATE_UNSPECIFIED	The job state is unspecified.
JOB_STATE_QUEUED	The job has been just created or resumed and processing has not yet begun.
JOB_STATE_PENDING	The service is preparing to run the job.
JOB_STATE_RUNNING	The job is in progress.
JOB_STATE_SUCCEEDED	The job completed successfully.
JOB_STATE_FAILED	The job failed.
JOB_STATE_CANCELLING	The job is being cancelled. From this state the job may only go to either JOB_STATE_SUCCEEDED, JOB_STATE_FAILED or JOB_STATE_CANCELLED.
JOB_STATE_CANCELLED	The job has been cancelled.
JOB_STATE_PAUSED	The job has been stopped, and can be resumed.
JOB_STATE_EXPIRED	The job has expired.
JOB_STATE_UPDATING	The job is being updated. Only jobs in the RUNNING state can be updated. After updating, the job goes back to the RUNNING state.
JOB_STATE_PARTIALLY_SUCCEEDED	The job is partially succeeded, some results may be missing due to errors.
LLMBasedMetricSpec
Specification for an LLM based metric.

Fields
Union field rubrics_source. Source of the rubrics to be used for evaluation. rubrics_source can be only one of the following:
rubric_group_key	
string

Use a pre-defined group of rubrics associated with the input. Refers to a key in the rubric_groups map of EvaluationInstance.

rubric_generation_spec	
RubricGenerationSpec

Dynamically generate rubrics using this specification.

predefined_rubric_generation_spec	
PredefinedMetricSpec

Dynamically generate rubrics using a predefined spec.

metric_prompt_template	
string

Required. Template for the prompt sent to the judge model.

system_instruction	
string

Optional. System instructions for the judge model.

judge_autorater_config	
AutoraterConfig

Optional. Optional configuration for the judge LLM (Autorater).

additional_config	
Struct

Optional. Optional additional configuration for the metric.

ListCachedContentsRequest
Request to list CachedContents.

Fields
parent	
string

Required. The parent, which owns this collection of cached contents.

page_size	
int32

Optional. The maximum number of cached contents to return. The service may return fewer than this value. If unspecified, some default (under maximum) number of items will be returned. The maximum value is 1000; values above 1000 will be coerced to 1000.

page_token	
string

Optional. A page token, received from a previous ListCachedContents call. Provide this to retrieve the subsequent page.

When paginating, all other parameters provided to ListCachedContents must match the call that provided the page token.

ListCachedContentsResponse
Response with a list of CachedContents.

Fields
cached_contents[]	
CachedContent

List of cached contents.

next_page_token	
string

A token, which can be sent as page_token to retrieve the next page. If this field is omitted, there are no subsequent pages.

ListEvaluationItemsRequest
Request message for EvaluationManagementService.ListEvaluationItems.

Fields
parent	
string

Required. The resource name of the Location from which to list the Evaluation Items. Format: projects/{project}/locations/{location}

page_size	
int32

Optional. The maximum number of Evaluation Items to return.

page_token	
string

Optional. A page token, received from a previous ListEvaluationItems call. Provide this to retrieve the subsequent page.

filter	
string

Optional. Filter expression that matches a subset of the EvaluationItems to show. For field names both snake_case and camelCase are supported. For more information about filter syntax, see AIP-160.

order_by	
string

Optional. A comma-separated list of fields to order by, sorted in ascending order by default. Use desc after a field name for descending.

ListEvaluationItemsResponse
Response message for EvaluationManagementService.ListEvaluationItems.

Fields
evaluation_items[]	
EvaluationItem

List of EvaluationItems in the requested page.

next_page_token	
string

A token to retrieve the next page of results.

ListEvaluationRunsRequest
Request message for EvaluationManagementService.ListEvaluationRuns.

Fields
parent	
string

Required. The resource name of the Location from which to list the Evaluation Runs. Format: projects/{project}/locations/{location}

page_size	
int32

Optional. The maximum number of Evaluation Runs to return.

page_token	
string

Optional. A page token, received from a previous ListEvaluationRuns call. Provide this to retrieve the subsequent page.

filter	
string

Optional. Filter expression that matches a subset of the EvaluationRuns to show. For field names both snake_case and camelCase are supported. For more information about filter syntax, see AIP-160.

order_by	
string

Optional. A comma-separated list of fields to order by, sorted in ascending order by default. Use desc after a field name for descending.

ListEvaluationRunsResponse
Response message for EvaluationManagementService.ListEvaluationRuns.

Fields
evaluation_runs[]	
EvaluationRun

List of EvaluationRuns in the requested page.

next_page_token	
string

A token to retrieve the next page of results.

ListEvaluationSetsRequest
Request message for EvaluationManagementService.ListEvaluationSets.

Fields
parent	
string

Required. The resource name of the Location from which to list the Evaluation Sets. Format: projects/{project}/locations/{location}

page_size	
int32

Optional. The maximum number of Evaluation Sets to return.

page_token	
string

Optional. A page token, received from a previous ListEvaluationSets call. Provide this to retrieve the subsequent page.

filter	
string

Optional. Filter expression that matches a subset of the EvaluationSets to show. For field names both snake_case and camelCase are supported. For more information about filter syntax, see AIP-160.

order_by	
string

Optional. A comma-separated list of fields to order by, sorted in ascending order by default. Use desc after a field name for descending.

ListEvaluationSetsResponse
Response message for EvaluationManagementService.ListEvaluationSets.

Fields
evaluation_sets[]	
EvaluationSet

List of EvaluationSets in the requested page.

next_page_token	
string

A token to retrieve the next page of results.

ListRagCorporaRequest
Request message for VertexRagDataService.ListRagCorpora.

Fields
parent	
string

Required. The resource name of the Location from which to list the RagCorpora. Format: projects/{project}/locations/{location}

page_size	
int32

Optional. The standard list page size.

page_token	
string

Optional. The standard list page token. Typically obtained via ListRagCorporaResponse.next_page_token of the previous VertexRagDataService.ListRagCorpora call.

ListRagCorporaResponse
Response message for VertexRagDataService.ListRagCorpora.

Fields
rag_corpora[]	
RagCorpus

List of RagCorpora in the requested page.

next_page_token	
string

A token to retrieve the next page of results. Pass to ListRagCorporaRequest.page_token to obtain that page.

ListRagFilesRequest
Request message for VertexRagDataService.ListRagFiles.

Fields
parent	
string

Required. The resource name of the RagCorpus from which to list the RagFiles. Format: projects/{project}/locations/{location}/ragCorpora/{rag_corpus}

page_size	
int32

Optional. The standard list page size.

page_token	
string

Optional. The standard list page token. Typically obtained via ListRagFilesResponse.next_page_token of the previous VertexRagDataService.ListRagFiles call.

ListRagFilesResponse
Response message for VertexRagDataService.ListRagFiles.

Fields
rag_files[]	
RagFile

List of RagFiles in the requested page.

next_page_token	
string

A token to retrieve the next page of results. Pass to ListRagFilesRequest.page_token to obtain that page.

ListReasoningEnginesRequest
Request message for ReasoningEngineService.ListReasoningEngines.

Fields
parent	
string

Required. The resource name of the Location to list the ReasoningEngines from. Format: projects/{project}/locations/{location}

filter	
string

Optional. The standard list filter. More detail in AIP-160.

page_size	
int32

Optional. The standard list page size.

page_token	
string

Optional. The standard list page token.

ListReasoningEnginesResponse
Response message for ReasoningEngineService.ListReasoningEngines

Fields
reasoning_engines[]	
ReasoningEngine

List of ReasoningEngines in the requested page.

next_page_token	
string

A token to retrieve the next page of results. Pass to ListReasoningEnginesRequest.page_token to obtain that page.

ListTuningJobsRequest
Request message for GenAiTuningService.ListTuningJobs.

Fields
parent	
string

Required. The resource name of the Location to list the TuningJobs from. Format: projects/{project}/locations/{location}

filter	
string

Optional. The standard list filter.

page_size	
int32

Optional. The standard list page size.

page_token	
string

Optional. The standard list page token. Typically obtained via ListTuningJobsResponse.next_page_token of the previous GenAiTuningService.ListTuningJob][] call.

ListTuningJobsResponse
Response message for GenAiTuningService.ListTuningJobs

Fields
tuning_jobs[]	
TuningJob

List of TuningJobs in the requested page.

next_page_token	
string

A token to retrieve the next page of results. Pass to ListTuningJobsRequest.page_token to obtain that page.

LogprobsResult
The log probabilities of the tokens generated by the model.

This is useful for understanding the model's confidence in its predictions and for debugging. For example, you can use log probabilities to identify when the model is making a less confident prediction or to explore alternative responses that the model considered. A low log probability can also indicate that the model is "hallucinating" or generating factually incorrect information.

Fields
top_candidates[]	
TopCandidates

A list of the top candidate tokens at each decoding step. The length of this list is equal to the total number of decoding steps.

chosen_candidates[]	
Candidate

A list of the chosen candidate tokens at each decoding step. The length of this list is equal to the total number of decoding steps. Note that the chosen candidate might not be in top_candidates.

Candidate
A single token and its associated log probability.

Fields
token	
string

The token's string representation.

token_id	
int32

The token's numerical ID. While the token field provides the string representation of the token, the token_id is the numerical representation that the model uses internally. This can be useful for developers who want to build custom logic based on the model's vocabulary.

log_probability	
float

The log probability of this token. A higher value indicates that the model was more confident in this token. The log probability can be used to assess the relative likelihood of different tokens and to identify when the model is uncertain.

TopCandidates
A list of the top candidate tokens and their log probabilities at each decoding step. This can be used to see what other tokens the model considered.

Fields
candidates[]	
Candidate

The list of candidate tokens, sorted by log probability in descending order.

MemoryBankCustomizationConfig
Configuration for organizing memories for a particular scope.

Fields
scope_keys[]	
string

Optional. The scope keys (i.e. 'user_id') for which to use this config. A request's scope must include all of the provided keys for the config to be used (order does not matter). If empty, then the config will be used for all requests that do not have a more specific config. Only one default config is allowed per Memory Bank.

memory_topics[]	
MemoryTopic

Optional. Topics of information that should be extracted from conversations and stored as memories. If not set, then Memory Bank's default topics will be used.

generate_memories_examples[]	
GenerateMemoriesExample

Optional. Examples of how to generate memories for a particular scope.

GenerateMemoriesExample
An example of how to generate memories for a particular scope.

Fields
generated_memories[]	
GeneratedMemory

Optional. The memories that are expected to be generated from the input conversation. An empty list indicates that no memories are expected to be generated for the input conversation.

Union field source. The input source for the example. source can be only one of the following:
conversation_source	
ConversationSource

A conversation source for the example.

ConversationSource
A conversation source for the example. This is similar to DirectContentsSource.

Fields
events[]	
Event

Optional. The input conversation events for the example.

Event
A single conversation event.

Fields
content	
Content

Required. The content of the event.

GeneratedMemory
A memory generated by the operation.

Fields
fact	
string

Required. The fact to generate a memory from.

topics[]	
MemoryTopicId

Optional. The list of topics that the memory should be associated with. For example, use custom_memory_topic_label = "jargon" if the extracted memory is an example of memory extraction for the custom topic jargon.

MemoryTopic
A topic of information that should be extracted from conversations and stored as memories.

Fields
Union field topic_type. The type of the topic. topic_type can be only one of the following:
custom_memory_topic	
CustomMemoryTopic

A custom memory topic defined by the developer.

managed_memory_topic	
ManagedMemoryTopic

A managed memory topic defined by Memory Bank.

CustomMemoryTopic
A custom memory topic defined by the developer.

Fields
label	
string

Required. The label of the topic.

description	
string

Required. Description of the memory topic. This should explain what information should be extracted for this topic.

ManagedMemoryTopic
A managed memory topic defined by the system.

Fields
managed_topic_enum	
ManagedTopicEnum

Required. The managed topic.

ManagedTopicEnum
Managed topics.

Enums
MANAGED_TOPIC_ENUM_UNSPECIFIED	Unspecified topic. This value should not be used.
USER_PERSONAL_INFO	Significant personal information about the User like first names, relationships, hobbies, important dates.
USER_PREFERENCES	Stated or implied likes, dislikes, preferred styles, or patterns.
KEY_CONVERSATION_DETAILS	Important milestones or conclusions within the dialogue.
EXPLICIT_INSTRUCTIONS	Information that the user explicitly requested to remember or forget.
MemoryTopicId
A memory topic identifier. This will be used to label a Memory and to restrict which topics are eligible for generation or retrieval.

Fields
Union field topic_id. Topic identifier. topic_id can be only one of the following:
custom_memory_topic_label	
string

Optional. The custom memory topic label.

managed_memory_topic	
ManagedTopicEnum

Optional. The managed memory topic.

Metric
The metric used for running evaluations.

Fields
aggregation_metrics[]	
AggregationMetric

Optional. The aggregation metrics to use.

Union field metric_spec. The spec for the metric. It would be either a pre-defined metric, or a inline metric spec. metric_spec can be only one of the following:
predefined_metric_spec	
PredefinedMetricSpec

The spec for a pre-defined metric.

llm_based_metric_spec	
LLMBasedMetricSpec

Spec for an LLM based metric.

custom_code_execution_spec	
CustomCodeExecutionSpec

Spec for Custom Code Execution metric.

pointwise_metric_spec	
PointwiseMetricSpec

Spec for pointwise metric.

pairwise_metric_spec	
PairwiseMetricSpec

Spec for pairwise metric.

exact_match_spec	
ExactMatchSpec

Spec for exact match metric.

bleu_spec	
BleuSpec

Spec for bleu metric.

rouge_spec	
RougeSpec

Spec for rouge metric.

AggregationMetric
The aggregation metrics supported by EvaluationService.EvaluateDataset.

Enums
AGGREGATION_METRIC_UNSPECIFIED	Unspecified aggregation metric.
AVERAGE	Average aggregation metric. Not supported for Pairwise metric.
MODE	Mode aggregation metric.
STANDARD_DEVIATION	Standard deviation aggregation metric. Not supported for pairwise metric.
VARIANCE	Variance aggregation metric. Not supported for pairwise metric.
MINIMUM	Minimum aggregation metric. Not supported for pairwise metric.
MAXIMUM	Maximum aggregation metric. Not supported for pairwise metric.
MEDIAN	Median aggregation metric. Not supported for pairwise metric.
PERCENTILE_P90	90th percentile aggregation metric. Not supported for pairwise metric.
PERCENTILE_P95	95th percentile aggregation metric. Not supported for pairwise metric.
PERCENTILE_P99	99th percentile aggregation metric. Not supported for pairwise metric.
MetricResult
Result for a single metric on a single instance.

Fields
rubric_verdicts[]	
RubricVerdict

Output only. For rubric-based metrics, the verdicts for each rubric.

score	
float

Output only. The score for the metric. Please refer to each metric's documentation for the meaning of the score.

explanation	
string

Output only. The explanation for the metric result.

error	
Status

Output only. The error status for the metric result.

MetricxInput
Input for MetricX metric.

Fields
metric_spec	
MetricxSpec

Required. Spec for Metricx metric.

instance	
MetricxInstance

Required. Metricx instance.

MetricxInstance
Spec for MetricX instance - The fields used for evaluation are dependent on the MetricX version.

Fields
prediction	
string

Required. Output of the evaluated model.

reference	
string

Optional. Ground truth used to compare against the prediction.

source	
string

Optional. Source text in original language.

MetricxResult
Spec for MetricX result - calculates the MetricX score for the given instance using the version specified in the spec.

Fields
score	
float

Output only. MetricX score. Range depends on version.

MetricxSpec
Spec for MetricX metric.

Fields
source_language	
string

Optional. Source language in BCP-47 format.

target_language	
string

Optional. Target language in BCP-47 format. Covers both prediction and reference.

version	
MetricxVersion

Required. Which version to use for evaluation.

MetricxVersion
MetricX Version options.

Enums
METRICX_VERSION_UNSPECIFIED	MetricX version unspecified.
METRICX_24_REF	MetricX 2024 (2.6) for translation + reference (reference-based).
METRICX_24_SRC	MetricX 2024 (2.6) for translation + source (QE).
METRICX_24_SRC_REF	MetricX 2024 (2.6) for translation + source + reference (source-reference-combined).
Modality
The modality of a Part of a Content message. A modality is the type of media, such as an image or a video. It is used to categorize the content of a Part for token counting purposes.

Enums
MODALITY_UNSPECIFIED	When a modality is not specified, it is treated as TEXT.
TEXT	The Part contains plain text.
IMAGE	The Part contains an image.
VIDEO	The Part contains a video.
AUDIO	The Part contains audio.
DOCUMENT	The Part contains a document, such as a PDF.
ModalityTokenCount
Represents a breakdown of token usage by modality.

This message is used in [CountTokensResponse][google.cloud.aiplatform.master.CountTokensResponse] and GenerateContentResponse.UsageMetadata to provide a detailed view of how many tokens are used by each modality (e.g., text, image, video) in a request. This is particularly useful for multimodal models, allowing you to track and manage token consumption for billing and quota purposes.

Fields
modality	
Modality

The modality that this token count applies to.

token_count	
int32

The number of tokens counted for this modality.

ModelArmorConfig
Configuration for Model Armor.

Model Armor is a Google Cloud service that provides safety and security filtering for prompts and responses. It helps protect your AI applications from risks such as harmful content, sensitive data leakage, and prompt injection attacks.

Fields
prompt_template_name	
string

Optional. The resource name of the Model Armor template to use for prompt screening.

A Model Armor template is a set of customized filters and thresholds that define how Model Armor screens content. If specified, Model Armor will use this template to check the user's prompt for safety and security risks before it is sent to the model.

The name must be in the format projects/{project}/locations/{location}/templates/{template}.

response_template_name	
string

Optional. The resource name of the Model Armor template to use for response screening.

A Model Armor template is a set of customized filters and thresholds that define how Model Armor screens content. If specified, Model Armor will use this template to check the model's response for safety and security risks before it is returned to the user.

The name must be in the format projects/{project}/locations/{location}/templates/{template}.

MultiSpeakerVoiceConfig
Configuration for a multi-speaker text-to-speech request.

Fields
speaker_voice_configs[]	
SpeakerVoiceConfig

Required. A list of configurations for the voices of the speakers. Exactly two speaker voice configurations must be provided.

OutputConfig
Config for evaluation output.

Fields
Union field destination. The destination for evaluation output. destination can be only one of the following:
gcs_destination	
GcsDestination

Cloud storage destination for evaluation output.

OutputFieldSpec
Defines a specification for a single output field.

Fields
field_name	
string

Required. The name of the output field.

guidance	
string

Optional. Optional, but recommended. Additional guidance specific to this field to provide targeted instructions for the LLM to generate the content of a single output field. While the LLM can sometimes infer content from the field name, providing explicit guidance is preferred.

field_type	
FieldType

Optional. The data type of the field. Defaults to CONTENT if not set.

FieldType
The data type of the field.

Enums
FIELD_TYPE_UNSPECIFIED	Field type is unspecified.
CONTENT	Arbitrary content field type.
TEXT	Text field type.
IMAGE	Image field type.
AUDIO	Audio field type.
OutputInfo
Describes the info for output of EvaluationService.EvaluateDataset.

Fields
Union field output_location. The output location into which evaluation output is written. output_location can be only one of the following:
gcs_output_directory	
string

Output only. The full path of the Cloud Storage directory created, into which the evaluation results and aggregation results are written.

PairwiseChoice
Pairwise prediction autorater preference.

Enums
PAIRWISE_CHOICE_UNSPECIFIED	Unspecified prediction choice.
BASELINE	Baseline prediction wins
CANDIDATE	Candidate prediction wins
TIE	Winner cannot be determined
PairwiseMetricInput
Input for pairwise metric.

Fields
metric_spec	
PairwiseMetricSpec

Required. Spec for pairwise metric.

instance	
PairwiseMetricInstance

Required. Pairwise metric instance.

PairwiseMetricInstance
Pairwise metric instance. Usually one instance corresponds to one row in an evaluation dataset.

Fields
Union field instance. Instance for pairwise metric. instance can be only one of the following:
json_instance	
string

Instance specified as a json string. String key-value pairs are expected in the json_instance to render PairwiseMetricSpec.instance_prompt_template.

content_map_instance	
ContentMap

Key-value contents for the mutlimodality input, including text, image, video, audio, and pdf, etc. The key is placeholder in metric prompt template, and the value is the multimodal content.

PairwiseMetricResult
Spec for pairwise metric result.

Fields
pairwise_choice	
PairwiseChoice

Output only. Pairwise metric choice.

explanation	
string

Output only. Explanation for pairwise metric score.

custom_output	
CustomOutput

Output only. Spec for custom output.

PairwiseMetricSpec
Spec for pairwise metric.

Fields
candidate_response_field_name	
string

Optional. The field name of the candidate response.

baseline_response_field_name	
string

Optional. The field name of the baseline response.

custom_output_format_config	
CustomOutputFormatConfig

Optional. CustomOutputFormatConfig allows customization of metric output. When this config is set, the default output is replaced with the raw output string. If a custom format is chosen, the pairwise_choice and explanation fields in the corresponding metric result will be empty.

metric_prompt_template	
string

Required. Metric prompt template for pairwise metric.

system_instruction	
string

Optional. System instructions for pairwise metric.

PairwiseQuestionAnsweringQualityInput
Input for pairwise question answering quality metric.

Fields
metric_spec	
PairwiseQuestionAnsweringQualitySpec

Required. Spec for pairwise question answering quality score metric.

instance	
PairwiseQuestionAnsweringQualityInstance

Required. Pairwise question answering quality instance.

PairwiseQuestionAnsweringQualityInstance
Spec for pairwise question answering quality instance.

Fields
prediction	
string

Required. Output of the candidate model.

baseline_prediction	
string

Required. Output of the baseline model.

reference	
string

Optional. Ground truth used to compare against the prediction.

context	
string

Required. Text to answer the question.

instruction	
string

Required. Question Answering prompt for LLM.

PairwiseQuestionAnsweringQualityResult
Spec for pairwise question answering quality result.

Fields
pairwise_choice	
PairwiseChoice

Output only. Pairwise question answering prediction choice.

explanation	
string

Output only. Explanation for question answering quality score.

confidence	
float

Output only. Confidence for question answering quality score.

PairwiseQuestionAnsweringQualitySpec
Spec for pairwise question answering quality score metric.

Fields
use_reference	
bool

Optional. Whether to use instance.reference to compute question answering quality.

version	
int32

Optional. Which version to use for evaluation.

PairwiseSummarizationQualityInput
Input for pairwise summarization quality metric.

Fields
metric_spec	
PairwiseSummarizationQualitySpec

Required. Spec for pairwise summarization quality score metric.

instance	
PairwiseSummarizationQualityInstance

Required. Pairwise summarization quality instance.

PairwiseSummarizationQualityInstance
Spec for pairwise summarization quality instance.

Fields
prediction	
string

Required. Output of the candidate model.

baseline_prediction	
string

Required. Output of the baseline model.

reference	
string

Optional. Ground truth used to compare against the prediction.

context	
string

Required. Text to be summarized.

instruction	
string

Required. Summarization prompt for LLM.

PairwiseSummarizationQualityResult
Spec for pairwise summarization quality result.

Fields
pairwise_choice	
PairwiseChoice

Output only. Pairwise summarization prediction choice.

explanation	
string

Output only. Explanation for summarization quality score.

confidence	
float

Output only. Confidence for summarization quality score.

PairwiseSummarizationQualitySpec
Spec for pairwise summarization quality score metric.

Fields
use_reference	
bool

Optional. Whether to use instance.reference to compute pairwise summarization quality.

version	
int32

Optional. Which version to use for evaluation.

Part
A datatype containing media that is part of a multi-part Content message.

A Part consists of data which has an associated datatype. A Part can only contain one of the accepted types in Part.data.

For media types that are not text, Part must have a fixed IANA MIME type identifying the type and subtype of the media if inline_data or file_data field is filled with raw bytes.

Fields
thought	
bool

Optional. Indicates whether the part represents the model's thought process or reasoning.

thought_signature	
bytes

Optional. An opaque signature for the thought so it can be reused in subsequent requests.

media_resolution	
MediaResolution

per part media resolution. Media resolution for the input media.

Union field data.

data can be only one of the following:

text	
string

Optional. The text content of the part.

inline_data	
Blob

Optional. The inline data content of the part. This can be used to include images, audio, or video in a request.

file_data	
FileData

Optional. The URI-based data of the part. This can be used to include files from Google Cloud Storage.

function_call	
FunctionCall

Optional. A predicted function call returned from the model. This contains the name of the function to call and the arguments to pass to the function.

function_response	
FunctionResponse

Optional. The result of a function call. This is used to provide the model with the result of a function call that it predicted.

executable_code	
ExecutableCode

Optional. Code generated by the model that is intended to be executed.

code_execution_result	
CodeExecutionResult

Optional. The result of executing the ExecutableCode.

Union field metadata.

metadata can be only one of the following:

video_metadata	
VideoMetadata

Optional. Video metadata. The metadata should only be specified while the video data is presented in inline_data or file_data.

MediaResolution
per part media resolution. Media resolution for the input media.

Fields
Union field value.

value can be only one of the following:

level	
Level

The tokenization quality used for given media.

Level
The media resolution level.

Enums
MEDIA_RESOLUTION_UNSPECIFIED	Media resolution has not been set.
MEDIA_RESOLUTION_LOW	Media resolution set to low.
MEDIA_RESOLUTION_MEDIUM	Media resolution set to medium.
MEDIA_RESOLUTION_HIGH	Media resolution set to high.
PartialArg
Partial argument value of the function call.

Fields
json_path	
string

Required. A JSON Path (RFC 9535) to the argument being streamed. https://datatracker.ietf.org/doc/html/rfc9535. e.g. "$.foo.bar[0].data".

will_continue	
bool

Optional. Whether this is not the last part of the same json_path. If true, another PartialArg message for the current json_path is expected to follow.

Union field delta. The delta of field value being streamed. delta can be only one of the following:
null_value	
NullValue

Optional. Represents a null value.

number_value	
double

Optional. Represents a double value.

string_value	
string

Optional. Represents a string value.

bool_value	
bool

Optional. Represents a boolean value.

PointwiseMetricInput
Input for pointwise metric.

Fields
metric_spec	
PointwiseMetricSpec

Required. Spec for pointwise metric.

instance	
PointwiseMetricInstance

Required. Pointwise metric instance.

PointwiseMetricInstance
Pointwise metric instance. Usually one instance corresponds to one row in an evaluation dataset.

Fields
Union field instance. Instance for pointwise metric. instance can be only one of the following:
json_instance	
string

Instance specified as a json string. String key-value pairs are expected in the json_instance to render PointwiseMetricSpec.instance_prompt_template.

content_map_instance	
ContentMap

Key-value contents for the mutlimodality input, including text, image, video, audio, and pdf, etc. The key is placeholder in metric prompt template, and the value is the multimodal content.

PointwiseMetricResult
Spec for pointwise metric result.

Fields
explanation	
string

Output only. Explanation for pointwise metric score.

custom_output	
CustomOutput

Output only. Spec for custom output.

score	
float

Output only. Pointwise metric score.

PointwiseMetricSpec
Spec for pointwise metric.

Fields
custom_output_format_config	
CustomOutputFormatConfig

Optional. CustomOutputFormatConfig allows customization of metric output. By default, metrics return a score and explanation. When this config is set, the default output is replaced with either: - The raw output string. - A parsed output based on a user-defined schema. If a custom format is chosen, the score and explanation fields in the corresponding metric result will be empty.

metric_prompt_template	
string

Required. Metric prompt template for pointwise metric.

system_instruction	
string

Optional. System instructions for pointwise metric.

PreTunedModel
A pre-tuned model for continuous tuning.

Fields
tuned_model_name	
string

The resource name of the Model. E.g., a model resource name with a specified version id or alias:

projects/{project}/locations/{location}/models/{model}@{version_id}

projects/{project}/locations/{location}/models/{model}@{alias}

Or, omit the version id to use the default version:

projects/{project}/locations/{location}/models/{model}

checkpoint_id	
string

Optional. The source checkpoint id. If not specified, the default checkpoint will be used.

base_model	
string

Output only. The name of the base model this PreTunedModel was tuned from.

PrebuiltVoiceConfig
Configuration for a prebuilt voice.

Fields
voice_name	
string

The name of the prebuilt voice to use.

PredefinedMetricSpec
The spec for a pre-defined metric.

Fields
metric_spec_name	
string

Required. The name of a pre-defined metric, such as "instruction_following_v1" or "text_quality_v1".

metric_spec_parameters	
Struct

Optional. The parameters needed to run the pre-defined metric.

PredictLongRunningRequest
Request message for PredictionService.PredictLongRunning.

Fields
endpoint	
string

Required. The name of the Endpoint requested to serve the prediction. Format: projects/{project}/locations/{location}/endpoints/{endpoint} or projects/{project}/locations/{location}/publishers/{publisher}/models/{model}

instances[]	
Value

Required. The instances that are the input to the prediction call. A DeployedModel may have an upper limit on the number of instances it supports per request, and when it is exceeded the prediction call errors in case of AutoML Models, or, in case of customer created Models, the behaviour is as documented by that Model. The schema of any single instance may be specified via Endpoint's DeployedModels' Model's PredictSchemata's instance_schema_uri.

parameters	
Value

Optional. The parameters that govern the prediction. The schema of the parameters may be specified via Endpoint's DeployedModels' Model's PredictSchemata's parameters_schema_uri.

PredictRequest
Request message for PredictionService.Predict.

Fields
endpoint	
string

Required. The resource name of the publisher model or endpiont requested to serve the prediction. For Google models like Embedding, Imagen, or Veo, use the publisher model format. For tuned models or other models deployed to a Vertex AI

Endpoint

, use the endpoint format.

Publisher model format:
projects/{project}/locations/{location}/publishers/google/models/{model}

Endpoint format:
projects/{project}/locations/{location}/endpoints/{endpoint}

instances[]	
Value

Required. The format of each instance is model-dependent. For Vertex AI Generative AI models, the instance schema can be one of the following types:

Text Embedding: TextEmbeddingPredictionInstance
Multimodal Embedding: VisionEmbeddingModelInstance
Imagen for image generation and editing: VisionGenerativeModelInstance
Imagen for virtual try-on: VirtualTryOnModelInstance
Imagen for visual question answering (VQA): VisionReasoningModelInstance
Veo for video generation: VideoGenerationModelInstance
parameters	
Value

The format of parameters is model-dependent. For Vertex AI Generative AI models, the parameters schema can be one of the following types:

Text Embedding: TextEmbeddingPredictionParams
Multimodal Embedding: VisionEmbeddingModelParams
Imagen for image generation and editing: VisionGenerativeModelParams
Imagen for virtual try-on: VirtualTryOnModelParams
Imagen for visual question answering (VQA): VisionReasoningModelParams
Veo for video generation: VideoGenerationModelParams
labels	
map<string, string>

Optional. The user labels for Imagen billing usage only. Only Imagen supports labels. For other use cases, it will be ignored.

PredictResponse
Response message for PredictionService.Predict.

Fields
predictions[]	
Value

The format of each prediction is model-dependent. For Vertex AI Generative AI models, the prediction schema can be one of the following types:

Text Embedding: TextEmbeddingPredictionResult
Multimodal Embedding: VisionEmbeddingModelResult
Imagen for image generation and editing: VisionGenerativeModelResult
Imagen for virtual try-on: VirtualTryOnModelResultProto
Imagen for visual question answering (VQA): VisionReasoningModelResult
Veo for video generation: VideoGenerationModelResult
deployed_model_id	
string

ID of the Endpoint's DeployedModel that served this prediction.

model	
string

Output only. The resource name of the Model which is deployed as the DeployedModel that this prediction hits.

model_version_id	
string

Output only. The version ID of the Model which is deployed as the DeployedModel that this prediction hits.

model_display_name	
string

Output only. The display name of the Model which is deployed as the DeployedModel that this prediction hits.

metadata	
Value

Output only. Request-level metadata returned by the model. The metadata type will be dependent upon the model implementation.

PreferenceOptimizationDataStats
Statistics computed for datasets used for preference optimization.

Fields
tuning_dataset_example_count	
int64

Output only. Number of examples in the tuning dataset.

total_billable_token_count	
int64

Output only. Number of billable tokens in the tuning dataset.

tuning_step_count	
int64

Output only. Number of tuning steps for this Tuning Job.

user_input_token_distribution	
DatasetDistribution

Output only. Dataset distributions for the user input tokens.

user_output_token_distribution	
DatasetDistribution

Output only. Dataset distributions for the user output tokens.

score_variance_per_example_distribution	
DatasetDistribution

Output only. Dataset distributions for scores variance per example.

scores_distribution	
DatasetDistribution

Output only. Dataset distributions for scores.

user_dataset_examples[]	
GeminiPreferenceExample

Output only. Sample user examples in the training dataset.

dropped_example_indices[]	
int64

Output only. A partial sample of the indices (starting from 1) of the dropped examples.

dropped_example_reasons[]	
string

Output only. For each index in dropped_example_indices, the user-facing reason why the example was dropped.

PreferenceOptimizationHyperParameters
Hyperparameters for Preference Optimization.

Fields
adapter_size	
AdapterSize

Optional. Adapter size for preference optimization.

epoch_count	
int64

Optional. Number of complete passes the model makes over the entire training dataset during training.

learning_rate_multiplier	
double

Optional. Multiplier for adjusting the default learning rate.

beta	
double

Optional. Weight for KL Divergence regularization.

PreferenceOptimizationSpec
Tuning Spec for Preference Optimization.

Fields
training_dataset_uri	
string

Required. Cloud Storage path to file containing training dataset for preference optimization tuning. The dataset must be formatted as a JSONL file.

hyper_parameters	
PreferenceOptimizationHyperParameters

Optional. Hyperparameters for Preference Optimization.

export_last_checkpoint_only	
bool

Optional. If set to true, disable intermediate checkpoints for Preference Optimization and only the last checkpoint will be exported. Otherwise, enable intermediate checkpoints for Preference Optimization. Default is false.

validation_dataset_uri	
string

Optional. Cloud Storage path to file containing validation dataset for preference optimization tuning. The dataset must be formatted as a JSONL file.

ProactivityConfig
Configures the model's proactivity. Proactivity determines how the model should respond to input. When proactivity is enabled, the model can choose to ignore irrelevant input, respond to contextual cues, and generate content even when not explicitly prompted. This is useful for more natural, human-like interactions in streaming use cases like audio and video.

Fields
proactive_audio	
bool

Optional. If enabled, the model can proactively respond to audio input, for example by ignoring out of context speech.

PscInterfaceConfig
Configuration for PSC-I.

Fields
network_attachment	
string

Optional. The name of the Compute Engine network attachment to attach to the resource within the region and user project. To specify this field, you must have already created a network attachment. This field is only used for resources using PSC-I.

dns_peering_configs[]	
DnsPeeringConfig

Optional. DNS peering configurations. When specified, Vertex AI will attempt to configure DNS peering zones in the tenant project VPC to resolve the specified domains using the target network's Cloud DNS. The user must grant the dns.peer role to the Vertex AI Service Agent on the target project.

QueryReasoningEngineRequest
Request message for [ReasoningEngineExecutionService.Query][].

Fields
name	
string

Required. The name of the ReasoningEngine resource to use. Format: projects/{project}/locations/{location}/reasoningEngines/{reasoning_engine}

input	
Struct

Optional. Input content provided by users in JSON object format. Examples include text query, function calling parameters, media bytes, etc.

class_method	
string

Optional. Class method to be used for the query. It is optional and defaults to "query" if unspecified.

QueryReasoningEngineResponse
Response message for [ReasoningEngineExecutionService.Query][]

Fields
output	
Value

Response provided by users in JSON object format.

QuestionAnsweringCorrectnessInput
Input for question answering correctness metric.

Fields
metric_spec	
QuestionAnsweringCorrectnessSpec

Required. Spec for question answering correctness score metric.

instance	
QuestionAnsweringCorrectnessInstance

Required. Question answering correctness instance.

QuestionAnsweringCorrectnessInstance
Spec for question answering correctness instance.

Fields
prediction	
string

Required. Output of the evaluated model.

reference	
string

Optional. Ground truth used to compare against the prediction.

context	
string

Optional. Text provided as context to answer the question.

instruction	
string

Required. The question asked and other instruction in the inference prompt.

QuestionAnsweringCorrectnessResult
Spec for question answering correctness result.

Fields
explanation	
string

Output only. Explanation for question answering correctness score.

score	
float

Output only. Question Answering Correctness score.

confidence	
float

Output only. Confidence for question answering correctness score.

QuestionAnsweringCorrectnessSpec
Spec for question answering correctness metric.

Fields
use_reference	
bool

Optional. Whether to use instance.reference to compute question answering correctness.

version	
int32

Optional. Which version to use for evaluation.

QuestionAnsweringHelpfulnessInput
Input for question answering helpfulness metric.

Fields
metric_spec	
QuestionAnsweringHelpfulnessSpec

Required. Spec for question answering helpfulness score metric.

instance	
QuestionAnsweringHelpfulnessInstance

Required. Question answering helpfulness instance.

QuestionAnsweringHelpfulnessInstance
Spec for question answering helpfulness instance.

Fields
prediction	
string

Required. Output of the evaluated model.

reference	
string

Optional. Ground truth used to compare against the prediction.

context	
string

Optional. Text provided as context to answer the question.

instruction	
string

Required. The question asked and other instruction in the inference prompt.

QuestionAnsweringHelpfulnessResult
Spec for question answering helpfulness result.

Fields
explanation	
string

Output only. Explanation for question answering helpfulness score.

score	
float

Output only. Question Answering Helpfulness score.

confidence	
float

Output only. Confidence for question answering helpfulness score.

QuestionAnsweringHelpfulnessSpec
Spec for question answering helpfulness metric.

Fields
use_reference	
bool

Optional. Whether to use instance.reference to compute question answering helpfulness.

version	
int32

Optional. Which version to use for evaluation.

QuestionAnsweringQualityInput
Input for question answering quality metric.

Fields
metric_spec	
QuestionAnsweringQualitySpec

Required. Spec for question answering quality score metric.

instance	
QuestionAnsweringQualityInstance

Required. Question answering quality instance.

QuestionAnsweringQualityInstance
Spec for question answering quality instance.

Fields
prediction	
string

Required. Output of the evaluated model.

reference	
string

Optional. Ground truth used to compare against the prediction.

context	
string

Required. Text to answer the question.

instruction	
string

Required. Question Answering prompt for LLM.

QuestionAnsweringQualityResult
Spec for question answering quality result.

Fields
explanation	
string

Output only. Explanation for question answering quality score.

score	
float

Output only. Question Answering Quality score.

confidence	
float

Output only. Confidence for question answering quality score.

QuestionAnsweringQualitySpec
Spec for question answering quality score metric.

Fields
use_reference	
bool

Optional. Whether to use instance.reference to compute question answering quality.

version	
int32

Optional. Which version to use for evaluation.

QuestionAnsweringRelevanceInput
Input for question answering relevance metric.

Fields
metric_spec	
QuestionAnsweringRelevanceSpec

Required. Spec for question answering relevance score metric.

instance	
QuestionAnsweringRelevanceInstance

Required. Question answering relevance instance.

QuestionAnsweringRelevanceInstance
Spec for question answering relevance instance.

Fields
prediction	
string

Required. Output of the evaluated model.

reference	
string

Optional. Ground truth used to compare against the prediction.

context	
string

Optional. Text provided as context to answer the question.

instruction	
string

Required. The question asked and other instruction in the inference prompt.

QuestionAnsweringRelevanceResult
Spec for question answering relevance result.

Fields
explanation	
string

Output only. Explanation for question answering relevance score.

score	
float

Output only. Question Answering Relevance score.

confidence	
float

Output only. Confidence for question answering relevance score.

QuestionAnsweringRelevanceSpec
Spec for question answering relevance metric.

Fields
use_reference	
bool

Optional. Whether to use instance.reference to compute question answering relevance.

version	
int32

Optional. Which version to use for evaluation.

RagChunk
A RagChunk includes the content of a chunk of a RagFile, and associated metadata.

Fields
text	
string

The content of the chunk.

page_span	
PageSpan

If populated, represents where the chunk starts and ends in the document.

PageSpan
Represents where the chunk starts and ends in the document.

Fields
first_page	
int32

Page where chunk starts in the document. Inclusive. 1-indexed.

last_page	
int32

Page where chunk ends in the document. Inclusive. 1-indexed.

RagContexts
Relevant contexts for one query.

Fields
contexts[]	
Context

All its contexts.

Context
A context of the query.

Fields
source_uri	
string

If the file is imported from Cloud Storage or Google Drive, source_uri will be original file URI in Cloud Storage or Google Drive; if file is uploaded, source_uri will be file display name.

source_display_name	
string

The file display name.

text	
string

The text chunk.

chunk	
RagChunk

Context of the retrieved chunk.

score	
double

According to the underlying Vector DB and the selected metric type, the score can be either the distance or the similarity between the query and the context and its range depends on the metric type.

For example, if the metric type is COSINE_DISTANCE, it represents the distance between the query and the context. The larger the distance, the less relevant the context is to the query. The range is [0, 2], while 0 means the most relevant and 2 means the least relevant.

RagCorpus
A RagCorpus is a RagFile container and a project can have multiple RagCorpora.

Fields
name	
string

Output only. The resource name of the RagCorpus.

display_name	
string

Required. The display name of the RagCorpus. The name can be up to 128 characters long and can consist of any UTF-8 characters.

description	
string

Optional. The description of the RagCorpus.

create_time	
Timestamp

Output only. Timestamp when this RagCorpus was created.

update_time	
Timestamp

Output only. Timestamp when this RagCorpus was last updated.

corpus_status	
CorpusStatus

Output only. RagCorpus state.

encryption_spec	
EncryptionSpec

Optional. Immutable. The CMEK key name used to encrypt at-rest data related to this Corpus. Only applicable to RagManagedDb option for Vector DB. This field can only be set at corpus creation time, and cannot be updated or deleted.

satisfies_pzs	
bool

Output only. Reserved for future use.

satisfies_pzi	
bool

Output only. Reserved for future use.

Union field backend_config. The backend config of the RagCorpus. It can be data store and/or retrieval engine. backend_config can be only one of the following:
vector_db_config	
RagVectorDbConfig

Optional. Immutable. The config for the Vector DBs.

vertex_ai_search_config	
VertexAiSearchConfig

Optional. Immutable. The config for the Vertex AI Search.

RagEmbeddingModelConfig
Config for the embedding model to use for RAG.

Fields
Union field model_config. The model config to use. model_config can be only one of the following:
vertex_prediction_endpoint	
VertexPredictionEndpoint

The Vertex AI Prediction Endpoint that either refers to a publisher model or an endpoint that is hosting a 1P fine-tuned text embedding model. Endpoints hosting non-1P fine-tuned text embedding models are currently not supported. This is used for dense vector search.

VertexPredictionEndpoint
Config representing a model hosted on Vertex Prediction Endpoint.

Fields
endpoint	
string

Required. The endpoint resource name. Format: projects/{project}/locations/{location}/publishers/{publisher}/models/{model} or projects/{project}/locations/{location}/endpoints/{endpoint}

model	
string

Output only. The resource name of the model that is deployed on the endpoint. Present only when the endpoint is not a publisher model. Pattern: projects/{project}/locations/{location}/models/{model}

model_version_id	
string

Output only. Version ID of the model that is deployed on the endpoint. Present only when the endpoint is not a publisher model.

RagEngineConfig
Config for RagEngine.

Fields
name	
string

Identifier. The name of the RagEngineConfig. Format: projects/{project}/locations/{location}/ragEngineConfig

rag_managed_db_config	
RagManagedDbConfig

The config of the RagManagedDb used by RagEngine.

RagFile
A RagFile contains user data for chunking, embedding and indexing.

Fields
name	
string

Output only. The resource name of the RagFile.

display_name	
string

Required. The display name of the RagFile. The name can be up to 128 characters long and can consist of any UTF-8 characters.

description	
string

Optional. The description of the RagFile.

create_time	
Timestamp

Output only. Timestamp when this RagFile was created.

update_time	
Timestamp

Output only. Timestamp when this RagFile was last updated.

file_status	
FileStatus

Output only. State of the RagFile.

user_metadata	
string

Output only. The metadata for metadata search. The user_metadata Needs to be in JSON format.

Union field rag_file_source. The origin location of the RagFile if it is imported from Google Cloud Storage or Google Drive. rag_file_source can be only one of the following:
gcs_source	
GcsSource

Output only. Google Cloud Storage location of the RagFile. It does not support wildcards in the Cloud Storage uri for now.

google_drive_source	
GoogleDriveSource

Output only. Google Drive location. Supports importing individual files as well as Google Drive folders.

direct_upload_source	
DirectUploadSource

Output only. The RagFile is encapsulated and uploaded in the UploadRagFile request.

slack_source	
SlackSource

The RagFile is imported from a Slack channel.

jira_source	
JiraSource

The RagFile is imported from a Jira query.

share_point_sources	
SharePointSources

The RagFile is imported from a SharePoint source.

RagFileChunkingConfig
Specifies the size and overlap of chunks for RagFiles.

Fields
Union field chunking_config. Specifies the chunking config for RagFiles. chunking_config can be only one of the following:
fixed_length_chunking	
FixedLengthChunking

Specifies the fixed length chunking config.

FixedLengthChunking
Specifies the fixed length chunking config.

Fields
chunk_size	
int32

The size of the chunks.

chunk_overlap	
int32

The overlap between chunks.

RagFileParsingConfig
Specifies the parsing config for RagFiles.

Fields
Union field parser. The parser to use for RagFiles. parser can be only one of the following:
layout_parser	
LayoutParser

The Layout Parser to use for RagFiles.

llm_parser	
LlmParser

The LLM Parser to use for RagFiles.

LayoutParser
Document AI Layout Parser config.

Fields
processor_name	
string

The full resource name of a Document AI processor or processor version. The processor must have type LAYOUT_PARSER_PROCESSOR. If specified, the additional_config.parse_as_scanned_pdf field must be false. Format: * projects/{project_id}/locations/{location}/processors/{processor_id} * projects/{project_id}/locations/{location}/processors/{processor_id}/processorVersions/{processor_version_id}

max_parsing_requests_per_min	
int32

The maximum number of requests the job is allowed to make to the Document AI processor per minute. Consult https://cloud.google.com/document-ai/quotas and the Quota page for your project to set an appropriate value here. If unspecified, a default value of 120 QPM would be used.

LlmParser
Specifies the LLM parsing for RagFiles.

Fields
model_name	
string

The name of a LLM model used for parsing. Format: * projects/{project_id}/locations/{location}/publishers/{publisher}/models/{model}

max_parsing_requests_per_min	
int32

The maximum number of requests the job is allowed to make to the LLM model per minute. Consult https://cloud.google.com/vertex-ai/generative-ai/docs/quotas and your document size to set an appropriate value here. If unspecified, a default value of 5000 QPM would be used.

custom_parsing_prompt	
string

The prompt to use for parsing. If not specified, a default prompt will be used.

RagFileTransformationConfig
Specifies the transformation config for RagFiles.

Fields
rag_file_chunking_config	
RagFileChunkingConfig

Specifies the chunking config for RagFiles.

RagManagedDbConfig
Configuration message for RagManagedDb used by RagEngine.

Fields
Union field tier. The tier of the RagManagedDb. tier can be only one of the following:
scaled	
Scaled

Sets the RagManagedDb to the Scaled tier. This is the default tier if not explicitly chosen.

basic	
Basic

Sets the RagManagedDb to the Basic tier.

unprovisioned	
Unprovisioned

Sets the RagManagedDb to the Unprovisioned tier.

Basic
This type has no fields.

Basic tier is a cost-effective and low compute tier suitable for the following cases: * Experimenting with RagManagedDb. * Small data size. * Latency insensitive workload. * Only using RAG Engine with external vector DBs.

NOTE: This is the default tier if not explicitly chosen.

Scaled
This type has no fields.

Scaled tier offers production grade performance along with autoscaling functionality. It is suitable for customers with large amounts of data or performance sensitive workloads.

Unprovisioned
This type has no fields.

Disables the RAG Engine service and deletes all your data held within this service. This will halt the billing of the service.

NOTE: Once deleted the data cannot be recovered. To start using RAG Engine again, you will need to update the tier by calling the UpdateRagEngineConfig API.

RagQuery
A query to retrieve relevant contexts.

Fields
rag_retrieval_config	
RagRetrievalConfig

Optional. The retrieval config for the query.

Union field query. The query to retrieve contexts. Currently only text query is supported. query can be only one of the following:
text	
string

Optional. The query in text format to get relevant contexts.

RagRetrievalConfig
Specifies the context retrieval config.

Fields
top_k	
int32

Optional. The number of contexts to retrieve.

filter	
Filter

Optional. Config for filters.

ranking	
Ranking

Optional. Config for ranking and reranking.

Filter
Config for filters.

Fields
metadata_filter	
string

Optional. String for metadata filtering.

Union field vector_db_threshold. Filter contexts retrieved from the vector DB based on either vector distance or vector similarity. vector_db_threshold can be only one of the following:
vector_distance_threshold	
double

Optional. Only returns contexts with vector distance smaller than the threshold.

vector_similarity_threshold	
double

Optional. Only returns contexts with vector similarity larger than the threshold.

Ranking
Config for ranking and reranking.

Fields
Union field ranking_config. Config options for ranking. Currently only Rank Service is supported. ranking_config can be only one of the following:
rank_service	
RankService

Optional. Config for Rank Service.

llm_ranker	
LlmRanker

Optional. Config for LlmRanker.

LlmRanker
Config for LlmRanker.

Fields
model_name	
string

Optional. The model name used for ranking. See Supported models.

RankService
Config for Rank Service.

Fields
model_name	
string

Optional. The model name of the rank service. Format: semantic-ranker-512@latest

RagVectorDbConfig
Config for the Vector DB to use for RAG.

Fields
api_auth	
ApiAuth

Authentication config for the chosen Vector DB.

rag_embedding_model_config	
RagEmbeddingModelConfig

Optional. Immutable. The embedding model config of the Vector DB.

Union field vector_db. The config for the Vector DB. vector_db can be only one of the following:
rag_managed_db	
RagManagedDb

The config for the RAG-managed Vector DB.

pinecone	
Pinecone

The config for the Pinecone.

vertex_vector_search	
VertexVectorSearch

The config for the Vertex Vector Search.

Pinecone
The config for the Pinecone.

Fields
index_name	
string

Pinecone index name. This value cannot be changed after it's set.

RagManagedDb
The config for the default RAG-managed Vector DB.

Fields
Union field retrieval_strategy. Choice of retrieval strategy. retrieval_strategy can be only one of the following:
knn	
KNN

Performs a KNN search on RagCorpus. Default choice if not specified.

ann	
ANN

Performs an ANN search on RagCorpus. Use this if you have a lot of files (> 10K) in your RagCorpus and want to reduce the search latency.

ANN
Config for ANN search.

RagManagedDb uses a tree-based structure to partition data and facilitate faster searches. As a tradeoff, it requires longer indexing time and manual triggering of index rebuild via the ImportRagFiles and UpdateRagCorpus API.

Fields
tree_depth	
int32

The depth of the tree-based structure. Only depth values of 2 and 3 are supported.

Recommended value is 2 if you have if you have O(10K) files in the RagCorpus and set this to 3 if more than that.

Default value is 2.

leaf_count	
int32

Number of leaf nodes in the tree-based structure. Each leaf node contains groups of closely related vectors along with their corresponding centroid.

Recommended value is 10 * sqrt(num of RagFiles in your RagCorpus).

Default value is 500.

KNN
This type has no fields.

Config for KNN search.

VertexVectorSearch
The config for the Vertex Vector Search.

Fields
index_endpoint	
string

The resource name of the Index Endpoint. Format: projects/{project}/locations/{location}/indexEndpoints/{index_endpoint}

index	
string

The resource name of the Index. Format: projects/{project}/locations/{location}/indexes/{index}

RawOutput
Raw output.

Fields
raw_output[]	
string

Output only. Raw output string.

RawPredictRequest
Request message for PredictionService.RawPredict.

Fields
endpoint	
string

Required. The name of the Endpoint requested to serve the prediction. Format: projects/{project}/locations/{location}/endpoints/{endpoint}

http_body	
HttpBody

The prediction input. Supports HTTP headers and arbitrary data payload.

A DeployedModel may have an upper limit on the number of instances it supports per request. When this limit it is exceeded for an AutoML model, the RawPredict method returns an error. When this limit is exceeded for a custom-trained model, the behavior varies depending on the model.

You can specify the schema for each instance in the predict_schemata.instance_schema_uri field when you create a Model. This schema applies when you deploy the Model as a DeployedModel to an Endpoint and use the RawPredict method.

RealtimeInputConfig
Configures the realtime input behavior in BidiGenerateContent.

Fields
automatic_activity_detection	
AutomaticActivityDetection

Optional. If not set, automatic activity detection is enabled by default. If automatic voice detection is disabled, the client must send activity signals.

activity_handling	
ActivityHandling

Optional. Defines what effect activity has.

turn_coverage	
TurnCoverage

Optional. Defines which input is included in the user's turn.

denoiser_config	
DenoiserConfig

Optional. The denoiser configuration.

ActivityHandling
The different ways of handling user activity.

Enums
ACTIVITY_HANDLING_UNSPECIFIED	If unspecified, the default behavior is START_OF_ACTIVITY_INTERRUPTS.
START_OF_ACTIVITY_INTERRUPTS	If true, start of activity will interrupt the model's response (also called "barge in"). The model's current response will be cut-off in the moment of the interruption. This is the default behavior.
NO_INTERRUPTION	The model's response will not be interrupted.
AutomaticActivityDetection
Configures automatic detection of activity.

Fields
start_of_speech_sensitivity	
StartSensitivity

Optional. Determines how likely speech is to be detected.

end_of_speech_sensitivity	
EndSensitivity

Optional. Determines how likely detected speech is ended.

prefix_padding_ms	
int32

Optional. The required duration of detected speech before start-of-speech is committed. The lower this value the more sensitive the start-of-speech detection is and the shorter speech can be recognized. However, this also increases the probability of false positives.

silence_duration_ms	
int32

Optional. The required duration of detected silence (or non-speech) before end-of-speech is committed. The larger this value, the longer speech gaps can be without interrupting the user's activity but this will increase the model's latency.

disabled	
bool

Optional. If enabled, detected voice and text input count as activity. If disabled, the client must send activity signals.

EndSensitivity
End of speech sensitivity.

Enums
END_SENSITIVITY_UNSPECIFIED	The default is END_SENSITIVITY_LOW.
END_SENSITIVITY_HIGH	Automatic detection ends speech more often.
END_SENSITIVITY_LOW	Automatic detection ends speech less often.
StartSensitivity
Start of speech sensitivity.

Enums
START_SENSITIVITY_UNSPECIFIED	The default is START_SENSITIVITY_LOW.
START_SENSITIVITY_HIGH	Automatic detection will detect the start of speech more often.
START_SENSITIVITY_LOW	Automatic detection will detect the start of speech less often.
TurnCoverage
Options about which input is included in the user's turn.

Enums
TURN_COVERAGE_UNSPECIFIED	If unspecified, the default behavior is TURN_INCLUDES_ALL_INPUT.
TURN_INCLUDES_ONLY_ACTIVITY	The users turn only includes activity since the last turn, excluding inactivity (e.g. silence on the audio stream).
TURN_INCLUDES_ALL_INPUT	The users turn includes all realtime input since the last turn, including inactivity (e.g. silence on the audio stream). This is the default behavior.
ReasoningEngine
ReasoningEngine provides a customizable runtime for models to determine which actions to take and in which order.

Fields
name	
string

Identifier. The resource name of the ReasoningEngine. Format: projects/{project}/locations/{location}/reasoningEngines/{reasoning_engine}

display_name	
string

Required. The display name of the ReasoningEngine.

description	
string

Optional. The description of the ReasoningEngine.

spec	
ReasoningEngineSpec

Optional. Configurations of the ReasoningEngine

create_time	
Timestamp

Output only. Timestamp when this ReasoningEngine was created.

update_time	
Timestamp

Output only. Timestamp when this ReasoningEngine was most recently updated.

etag	
string

Optional. Used to perform consistent read-modify-write updates. If not set, a blind "overwrite" update happens.

context_spec	
ReasoningEngineContextSpec

Optional. Configuration for how Agent Engine sub-resources should manage context.

encryption_spec	
EncryptionSpec

Customer-managed encryption key spec for a ReasoningEngine. If set, this ReasoningEngine and all sub-resources of this ReasoningEngine will be secured by this key.

labels	
map<string, string>

Labels for the ReasoningEngine.

ReasoningEngineContextSpec
Configuration for how Agent Engine sub-resources should manage context.

Fields
memory_bank_config	
MemoryBankConfig

Optional. Specification for a Memory Bank, which manages memories for the Agent Engine.

MemoryBankConfig
Specification for a Memory Bank.

Fields
generation_config	
GenerationConfig

Optional. Configuration for how to generate memories for the Memory Bank.

similarity_search_config	
SimilaritySearchConfig

Optional. Configuration for how to perform similarity search on memories. If not set, the Memory Bank will use the default embedding model text-embedding-005.

customization_configs[]	
MemoryBankCustomizationConfig

Optional. Configuration for how to customize Memory Bank behavior for a particular scope.

ttl_config	
TtlConfig

Optional. Configuration for automatic TTL ("time-to-live") of the memories in the Memory Bank. If not set, TTL will not be applied automatically. The TTL can be explicitly set by modifying the expire_time of each Memory resource.

disable_memory_revisions	
bool

If true, no memory revisions will be created for any requests to the Memory Bank.

GenerationConfig
Configuration for how to generate memories.

Fields
model	
string

Required. The model used to generate memories. Format: projects/{project}/locations/{location}/publishers/google/models/{model}.

SimilaritySearchConfig
Configuration for how to perform similarity search on memories.

Fields
embedding_model	
string

Required. The model used to generate embeddings to lookup similar memories. Format: projects/{project}/locations/{location}/publishers/google/models/{model}.

TtlConfig
Configuration for automatically setting the TTL ("time-to-live") of the memories in the Memory Bank.

Fields
Union field ttl. Configuration for automatically setting the TTL of the memories in the Memory Bank. ttl can be only one of the following:
default_ttl	
Duration

Optional. The default TTL duration of the memories in the Memory Bank. This applies to all operations that create or update a memory.

granular_ttl_config	
GranularTtlConfig

Optional. The granular TTL configuration of the memories in the Memory Bank.

Union field memory_revision_ttl. Configuration for automatically setting the TTL of the memory revisions in the Memory Bank. memory_revision_ttl can be only one of the following:
memory_revision_default_ttl	
Duration

Optional. The default TTL duration of the memory revisions in the Memory Bank. This applies to all operations that create a memory revision. If not set, a default TTL of 365 days will be used.

GranularTtlConfig
Configuration for TTL of the memories in the Memory Bank based on the action that created or updated the memory.

Fields
create_ttl	
Duration

Optional. The TTL duration for memories uploaded via CreateMemory.

generate_created_ttl	
Duration

Optional. The TTL duration for memories newly generated via GenerateMemories (GenerateMemoriesResponse.GeneratedMemory.Action.CREATED).

generate_updated_ttl	
Duration

Optional. The TTL duration for memories updated via GenerateMemories (GenerateMemoriesResponse.GeneratedMemory.Action.UPDATED). In the case of an UPDATE action, the expire_time of the existing memory will be updated to the new value (now + TTL).

ReasoningEngineSpec
ReasoningEngine configurations

Fields
package_spec	
PackageSpec

Optional. User provided package spec of the ReasoningEngine. Ignored when users directly specify a deployment image through deployment_spec.first_party_image_override, but keeping the field_behavior to avoid introducing breaking changes. The deployment_source field should not be set if package_spec is specified.

deployment_spec	
DeploymentSpec

Optional. The specification of a Reasoning Engine deployment.

class_methods[]	
Struct

Optional. Declarations for object class methods in OpenAPI specification format.

agent_framework	
string

Optional. The OSS agent framework used to develop the agent. Currently supported values: "google-adk", "langchain", "langgraph", "ag2", "llama-index", "custom".

Union field deployment_source. Defines the source for the deployment. The package_spec field should not be set if deployment_source is specified. deployment_source can be only one of the following:
source_code_spec	
SourceCodeSpec

Deploy from source code files with a defined entrypoint.

service_account	
string

Optional. The service account that the Reasoning Engine artifact runs as. It should have "roles/storage.objectViewer" for reading the user project's Cloud Storage and "roles/aiplatform.user" for using Vertex extensions. If not specified, the Vertex AI Reasoning Engine Service Agent in the project will be used.

DeploymentSpec
The specification of a Reasoning Engine deployment.

Fields
env[]	
EnvVar

Optional. Environment variables to be set with the Reasoning Engine deployment. The environment variables can be updated through the UpdateReasoningEngine API.

secret_env[]	
SecretEnvVar

Optional. Environment variables where the value is a secret in Cloud Secret Manager. To use this feature, add 'Secret Manager Secret Accessor' role (roles/secretmanager.secretAccessor) to AI Platform Reasoning Engine Service Agent.

psc_interface_config	
PscInterfaceConfig

Optional. Configuration for PSC-I.

resource_limits	
map<string, string>

Optional. Resource limits for each container. Only 'cpu' and 'memory' keys are supported. Defaults to {"cpu": "4", "memory": "4Gi"}.

The only supported values for CPU are '1', '2', '4', '6' and '8'. For more information, go to https://cloud.google.com/run/docs/configuring/cpu.
The only supported values for memory are '1Gi', '2Gi', ... '32 Gi'.
For required cpu on different memory values, go to https://cloud.google.com/run/docs/configuring/memory-limits
min_instances	
int32

Optional. The minimum number of application instances that will be kept running at all times. Defaults to 1. Range: [0, 10].

max_instances	
int32

Optional. The maximum number of application instances that can be launched to handle increased traffic. Defaults to 100. Range: [1, 1000].

If VPC-SC or PSC-I is enabled, the acceptable range is [1, 100].

container_concurrency	
int32

Optional. Concurrency for each container and agent server. Recommended value: 2 * cpu + 1. Defaults to 9.

PackageSpec
User-provided package specification, containing pickled object and package requirements.

Fields
pickle_object_gcs_uri	
string

Optional. The Cloud Storage URI of the pickled python object.

dependency_files_gcs_uri	
string

Optional. The Cloud Storage URI of the dependency files in tar.gz format.

requirements_gcs_uri	
string

Optional. The Cloud Storage URI of the requirements.txt file

python_version	
string

Optional. The Python version. Supported values are 3.9, 3.10, 3.11, 3.12, 3.13. If not specified, the default value is 3.10.

SourceCodeSpec
Specification for deploying from source code.

Fields
Union field source. Specifies where the source code is located. source can be only one of the following:
inline_source	
InlineSource

Source code is provided directly in the request.

developer_connect_source	
DeveloperConnectSource

Source code is in a Git repository managed by Developer Connect.

Union field language_spec. Specifies the language-specific configuration for building and running the code. language_spec can be only one of the following:
python_spec	
PythonSpec

Configuration for a Python application.

DeveloperConnectConfig
Specifies the configuration for fetching source code from a Git repository that is managed by Developer Connect. This includes the repository, revision, and directory to use.

Fields
git_repository_link	
string

Required. The Developer Connect Git repository link, formatted as projects/*/locations/*/connections/*/gitRepositoryLink/*.

dir	
string

Required. Directory, relative to the source root, in which to run the build.

revision	
string

Required. The revision to fetch from the Git repository such as a branch, a tag, a commit SHA, or any Git ref.

DeveloperConnectSource
Specifies source code to be fetched from a Git repository managed through the Developer Connect service.

Fields
config	
DeveloperConnectConfig

Required. The Developer Connect configuration that defines the specific repository, revision, and directory to use as the source code root.

InlineSource
Specifies source code provided as a byte stream.

Fields
source_archive	
bytes

Required. Input only. The application source code archive. It must be a compressed tarball (.tar.gz) file.

PythonSpec
Specification for running a Python application from source.

Fields
version	
string

Optional. The version of Python to use. Support version includes 3.9, 3.10, 3.11, 3.12, 3.13. If not specified, default value is 3.10.

entrypoint_module	
string

Optional. The Python module to load as the entrypoint, specified as a fully qualified module name. For example: path.to.agent. If not specified, defaults to "agent".

The project root will be added to Python sys.path, allowing imports to be specified relative to the root.

entrypoint_object	
string

Optional. The name of the callable object within the entrypoint_module to use as the application If not specified, defaults to "root_agent".

requirements_file	
string

Optional. The path to the requirements file, relative to the source root. If not specified, defaults to "requirements.txt".

RebaseTunedModelOperationMetadata
Runtime operation information for GenAiTuningService.RebaseTunedModel.

Fields
generic_metadata	
GenericOperationMetadata

The common part of the operation generic information.

RebaseTunedModelRequest
Request message for GenAiTuningService.RebaseTunedModel.

Fields
parent	
string

Required. The resource name of the Location into which to rebase the Model. Format: projects/{project}/locations/{location}

tuned_model_ref	
TunedModelRef

Required. TunedModel reference to retrieve the legacy model information.

tuning_job	
TuningJob

Optional. The TuningJob to be updated. Users can use this TuningJob field to overwrite tuning configs.

artifact_destination	
GcsDestination

Optional. The Google Cloud Storage location to write the artifacts.

deploy_to_same_endpoint	
bool

Optional. By default, bison to gemini migration will always create new model/endpoint, but for gemini-1.0 to gemini-1.5 migration, we default deploy to the same endpoint. See details in this Section.

ReplicatedVoiceConfig
The configuration for the replicated voice to use.

Fields
mime_type	
string

Optional. The mimetype of the voice sample. Currently only mime_type=audio/pcm is supported, which is raw mono 16-bit signed little-endian pcm data, with 24k sampling rate.

voice_sample_audio	
bytes

Optional. The sample of the custom voice.

Retrieval
Defines a retrieval tool that model can call to access external knowledge.

Fields
disable_attribution
(deprecated)	
bool

This item is deprecated!

Optional. Deprecated. This option is no longer supported.

Union field source. The source of the retrieval. source can be only one of the following:
vertex_ai_search	
VertexAISearch

Set to use data source powered by Vertex AI Search.

vertex_rag_store	
VertexRagStore

Set to use data source powered by Vertex RAG store. User data is uploaded via the VertexRagDataService.

external_api	
ExternalApi

Use data source powered by external API for grounding.

RetrievalConfig
Retrieval config.

Fields
lat_lng	
LatLng

The location of the user.

language_code	
string

The language code of the user.

RetrievalMetadata
Metadata related to the retrieval grounding source. This is part of the GroundingMetadata returned when grounding is enabled.

Fields
google_search_dynamic_retrieval_score	
float

Optional. A score indicating how likely it is that a Google Search query could help answer the prompt. The score is in the range of [0, 1]. A score of 1 means the model is confident that a search will be helpful, and 0 means it is not. This score is populated only when Google Search grounding and dynamic retrieval are enabled. The score is used to determine whether to trigger a search.

RetrieveContextsRequest
Request message for VertexRagService.RetrieveContexts.

Fields
parent	
string

Required. The resource name of the Location from which to retrieve RagContexts. The users must have permission to make a call in the project. Format: projects/{project}/locations/{location}.

query	
RagQuery

Required. Single RAG retrieve query.

Union field data_source. Data Source to retrieve contexts. data_source can be only one of the following:
vertex_rag_store	
VertexRagStore

The data source for Vertex RagStore.

VertexRagStore
The data source for Vertex RagStore.

Fields
rag_resources[]	
RagResource

Optional. The representation of the rag source. It can be used to specify corpus only or ragfiles. Currently only support one corpus or multiple files from one corpus. In the future we may open up multiple corpora support.

vector_distance_threshold
(deprecated)	
double

This item is deprecated!

Optional. Only return contexts with vector distance smaller than the threshold.

RagResource
The definition of the Rag resource.

Fields
rag_corpus	
string

Optional. RagCorpora resource name. Format: projects/{project}/locations/{location}/ragCorpora/{rag_corpus}

rag_file_ids[]	
string

Optional. rag_file_id. The files should be in the same rag_corpus set in rag_corpus field.

RetrieveContextsResponse
Response message for VertexRagService.RetrieveContexts.

Fields
contexts	
RagContexts

The contexts of the query.

RougeInput
Input for rouge metric.

Fields
metric_spec	
RougeSpec

Required. Spec for rouge score metric.

instances[]	
RougeInstance

Required. Repeated rouge instances.

RougeInstance
Spec for rouge instance.

Fields
prediction	
string

Required. Output of the evaluated model.

reference	
string

Required. Ground truth used to compare against the prediction.

RougeMetricValue
Rouge metric value for an instance.

Fields
score	
float

Output only. Rouge score.

RougeResults
Results for rouge metric.

Fields
rouge_metric_values[]	
RougeMetricValue

Output only. Rouge metric values.

RougeSpec
Spec for rouge score metric - calculates the recall of n-grams in prediction as compared to reference - returns a score ranging between 0 and 1.

Fields
rouge_type	
string

Optional. Supported rouge types are rougen[1-9], rougeL, and rougeLsum.

use_stemmer	
bool

Optional. Whether to use stemmer to compute rouge score.

split_summaries	
bool

Optional. Whether to split summaries while using rougeLsum.

Rubric
Message representing a single testable criterion for evaluation. One input prompt could have multiple rubrics.

Fields
rubric_id	
string

Unique identifier for the rubric. This ID is used to refer to this rubric, e.g., in RubricVerdict.

content	
Content

Required. The actual testable criteria for the rubric.

type	
string

Optional. A type designator for the rubric, which can inform how it's evaluated or interpreted by systems or users. It's recommended to use consistent, well-defined, upper snake_case strings. Examples: "SUMMARIZATION_QUALITY", "SAFETY_HARMFUL_CONTENT", "INSTRUCTION_ADHERENCE".

importance	
Importance

Optional. The relative importance of this rubric.

Content
Content of the rubric, defining the testable criteria.

Fields
Union field content_type.

content_type can be only one of the following:

property	
Property

Evaluation criteria based on a specific property.

Property
Defines criteria based on a specific property.

Fields
description	
string

Description of the property being evaluated. Example: "The model's response is grammatically correct."

Importance
Importance level of the rubric.

Enums
IMPORTANCE_UNSPECIFIED	Importance is not specified.
HIGH	High importance.
MEDIUM	Medium importance.
LOW	Low importance.
RubricBasedInstructionFollowingInput
Instance and metric spec for RubricBasedInstructionFollowing metric.

Fields
metric_spec	
RubricBasedInstructionFollowingSpec

Required. Spec for RubricBasedInstructionFollowing metric.

instance	
RubricBasedInstructionFollowingInstance

Required. Instance for RubricBasedInstructionFollowing metric.

RubricBasedInstructionFollowingInstance
Instance for RubricBasedInstructionFollowing metric - one instance corresponds to one row in an evaluation dataset.

Fields
Union field instance. Instance for RubricBasedInstructionFollowing metric. instance can be only one of the following:
json_instance	
string

Required. Instance specified as a json string. String key-value pairs are expected in the json_instance to render RubricBasedInstructionFollowing prompt templates.

RubricBasedInstructionFollowingResult
Result for RubricBasedInstructionFollowing metric.

Fields
rubric_critique_results[]	
RubricCritiqueResult

Output only. List of per rubric critique results.

score	
float

Output only. Overall score for the instruction following.

RubricBasedInstructionFollowingSpec
This type has no fields.

Spec for RubricBasedInstructionFollowing metric - returns rubrics and verdicts corresponding to rubrics along with overall score.

RubricCritiqueResult
Rubric critique result.

Fields
rubric	
string

Output only. Rubric to be evaluated.

verdict	
bool

Output only. Verdict for the rubric - true if the rubric is met, false otherwise.

RubricGenerationSpec
Specification for how rubrics should be generated.

Fields
prompt_template	
string

Template for the prompt used to generate rubrics. The details should be updated based on the most-recent recipe requirements.

rubric_content_type	
RubricContentType

The type of rubric content to be generated.

rubric_type_ontology[]	
string

Optional. An optional, pre-defined list of allowed types for generated rubrics. If this field is provided, it implies include_rubric_type should be true, and the generated rubric types should be chosen from this ontology.

model_config	
AutoraterConfig

Configuration for the model used in rubric generation. Configs including sampling count and base model can be specified here. Flipping is not supported for rubric generation.

RubricContentType
Specifies the type of rubric content to generate.

Enums
RUBRIC_CONTENT_TYPE_UNSPECIFIED	The content type to generate is not specified.
PROPERTY	Generate rubrics based on properties.
NL_QUESTION_ANSWER	Generate rubrics in an NL question answer format.
PYTHON_CODE_ASSERTION	Generate rubrics in a unit test format.
RubricGroup
A group of rubrics, used for grouping rubrics based on a metric or a version.

Fields
group_id	
string

Unique identifier for the group.

display_name	
string

Human-readable name for the group. This should be unique within a given context if used for display or selection. Example: "Instruction Following V1", "Content Quality - Summarization Task".

rubrics[]	
Rubric

Rubrics that are part of this group.

RubricVerdict
Represents the verdict of an evaluation against a single rubric.

Fields
evaluated_rubric	
Rubric

Required. The full rubric definition that was evaluated. Storing this ensures the verdict is self-contained and understandable, especially if the original rubric definition changes or was dynamically generated.

verdict	
bool

Required. Outcome of the evaluation against the rubric, represented as a boolean. true indicates a "Pass", false indicates a "Fail".

reasoning	
string

Optional. Human-readable reasoning or explanation for the verdict. This can include specific examples or details from the evaluated content that justify the given verdict.

SafetyInput
Input for safety metric.

Fields
metric_spec	
SafetySpec

Required. Spec for safety metric.

instance	
SafetyInstance

Required. Safety instance.

SafetyInstance
Spec for safety instance.

Fields
prediction	
string

Required. Output of the evaluated model.

SafetyRating
A safety rating for a piece of content.

The safety rating contains the harm category and the harm probability level.

Fields
category	
HarmCategory

Output only. The harm category of this rating.

probability	
HarmProbability

Output only. The probability of harm for this category.

probability_score	
float

Output only. The probability score of harm for this category.

severity	
HarmSeverity

Output only. The severity of harm for this category.

severity_score	
float

Output only. The severity score of harm for this category.

blocked	
bool

Output only. Indicates whether the content was blocked because of this rating.

overwritten_threshold	
HarmBlockThreshold

Output only. The overwritten threshold for the safety category of Gemini 2.0 image out. If minors are detected in the output image, the threshold of each safety category will be overwritten if user sets a lower threshold.

HarmProbability
The probability of harm for a given category.

Enums
HARM_PROBABILITY_UNSPECIFIED	The harm probability is unspecified.
NEGLIGIBLE	The harm probability is negligible.
LOW	The harm probability is low.
MEDIUM	The harm probability is medium.
HIGH	The harm probability is high.
HarmSeverity
The severity of harm for a given category.

Enums
HARM_SEVERITY_UNSPECIFIED	The harm severity is unspecified.
HARM_SEVERITY_NEGLIGIBLE	The harm severity is negligible.
HARM_SEVERITY_LOW	The harm severity is low.
HARM_SEVERITY_MEDIUM	The harm severity is medium.
HARM_SEVERITY_HIGH	The harm severity is high.
SafetyResult
Spec for safety result.

Fields
explanation	
string

Output only. Explanation for safety score.

score	
float

Output only. Safety score.

confidence	
float

Output only. Confidence for safety score.

SafetySetting
A safety setting that affects the safety-blocking behavior.

A SafetySetting consists of a harm category and a threshold for that category.

Fields
category	
HarmCategory

Required. The harm category to be blocked.

threshold	
HarmBlockThreshold

Required. The threshold for blocking content. If the harm probability exceeds this threshold, the content will be blocked.

method	
HarmBlockMethod

Optional. The method for blocking content. If not specified, the default behavior is to use the probability score.

HarmBlockMethod
The method for blocking content.

Enums
HARM_BLOCK_METHOD_UNSPECIFIED	The harm block method is unspecified.
SEVERITY	The harm block method uses both probability and severity scores.
PROBABILITY	The harm block method uses the probability score.
HarmBlockThreshold
Thresholds for blocking content based on harm probability.

Enums
HARM_BLOCK_THRESHOLD_UNSPECIFIED	The harm block threshold is unspecified.
BLOCK_LOW_AND_ABOVE	Block content with a low harm probability or higher.
BLOCK_MEDIUM_AND_ABOVE	Block content with a medium harm probability or higher.
BLOCK_ONLY_HIGH	Block content with a high harm probability.
BLOCK_NONE	Do not block any content, regardless of its harm probability.
OFF	Turn off the safety filter entirely.
SafetySpec
Spec for safety metric.

Fields
version	
int32

Optional. Which version to use for evaluation.

Schema
Schema is used to define the format of input/output data. Represents a select subset of an OpenAPI 3.0 schema object. More fields may be added in the future as needed.

Fields
type	
Type

Optional. The type of the data.

format	
string

Optional. The format of the data. Supported formats: for NUMBER type: "float", "double" for INTEGER type: "int32", "int64" for STRING type: "email", "byte", etc

title	
string

Optional. The title of the Schema.

description	
string

Optional. The description of the data.

nullable	
bool

Optional. Indicates if the value may be null.

default	
Value

Optional. Default value of the data.

items	
Schema

Optional. SCHEMA FIELDS FOR TYPE ARRAY Schema of the elements of Type.ARRAY.

min_items	
int64

Optional. Minimum number of the elements for Type.ARRAY.

max_items	
int64

Optional. Maximum number of the elements for Type.ARRAY.

enum[]	
string

Optional. Possible values of the element of primitive type with enum format. Examples: 1. We can define direction as : {type:STRING, format:enum, enum:["EAST", NORTH", "SOUTH", "WEST"]} 2. We can define apartment number as : {type:INTEGER, format:enum, enum:["101", "201", "301"]}

properties	
map<string, Schema>

Optional. SCHEMA FIELDS FOR TYPE OBJECT Properties of Type.OBJECT.

property_ordering[]	
string

Optional. The order of the properties. Not a standard field in open api spec. Only used to support the order of the properties.

required[]	
string

Optional. Required properties of Type.OBJECT.

min_properties	
int64

Optional. Minimum number of the properties for Type.OBJECT.

max_properties	
int64

Optional. Maximum number of the properties for Type.OBJECT.

minimum	
double

Optional. SCHEMA FIELDS FOR TYPE INTEGER and NUMBER Minimum value of the Type.INTEGER and Type.NUMBER

maximum	
double

Optional. Maximum value of the Type.INTEGER and Type.NUMBER

min_length	
int64

Optional. SCHEMA FIELDS FOR TYPE STRING Minimum length of the Type.STRING

max_length	
int64

Optional. Maximum length of the Type.STRING

pattern	
string

Optional. Pattern of the Type.STRING to restrict a string to a regular expression.

example	
Value

Optional. Example of the object. Will only populated when the object is the root.

any_of[]	
Schema

Optional. The value should be validated against any (one or more) of the subschemas in the list.

additional_properties	
Value

Optional. Can either be a boolean or an object; controls the presence of additional properties.

ref	
string

Optional. Allows indirect references between schema nodes. The value should be a valid reference to a child of the root defs.

For example, the following schema defines a reference to a schema node named "Pet":

type: object properties: pet: ref: #/defs/Pet defs: Pet: type: object properties: name: type: string

The value of the "pet" property is a reference to the schema node named "Pet". See details in https://json-schema.org/understanding-json-schema/structuring

defs	
map<string, Schema>

Optional. A map of definitions for use by ref Only allowed at the root of the schema.

SearchEntryPoint
An entry point for displaying Google Search results.

A SearchEntryPoint is populated when the grounding source for a model's response is Google Search. It provides information that you can use to display the search results in your application.

Fields
rendered_content	
string

Optional. An HTML snippet that can be embedded in a web page or an application's webview. This snippet displays a search result, including the title, URL, and a brief description of the search result.

sdk_blob	
bytes

Optional. A base64-encoded JSON object that contains a list of search queries and their corresponding search URLs. This information can be used to build a custom search UI.

SecretEnvVar
Represents an environment variable where the value is a secret in Cloud Secret Manager.

Fields
name	
string

Required. Name of the secret environment variable.

secret_ref	
SecretRef

Required. Reference to a secret stored in the Cloud Secret Manager that will provide the value for this environment variable.

SecretRef
Reference to a secret stored in the Cloud Secret Manager that will provide the value for this environment variable.

Fields
secret	
string

Required. The name of the secret in Cloud Secret Manager. Format: {secret_name}.

version	
string

The Cloud Secret Manager secret version. Can be 'latest' for the latest version, an integer for a specific version, or a version alias.

Segment
A segment of the content.

Fields
part_index	
int32

Output only. The index of the Part object that this segment belongs to. This is useful for associating the segment with a specific part of the content.

start_index	
int32

Output only. The start index of the segment in the Part, measured in bytes. This marks the beginning of the segment and is inclusive, meaning the byte at this index is the first byte of the segment.

end_index	
int32

Output only. The end index of the segment in the Part, measured in bytes. This marks the end of the segment and is exclusive, meaning the segment includes content up to, but not including, the byte at this index.

text	
string

Output only. The text of the segment.

SessionResumptionConfig
Configuration of session resumption mechanism.

Included in BidiGenerateContentSetup.session_resumption. If included server will send SessionResumptionUpdate messages.

Fields
transparent	
bool

Optional. If set requests server to send updates with message_index of last message sent from client included in session state.

handle	
string

Session resumption handle of previous session (session to restore).

If not present new session will be started.

SessionResumptionUpdate
Update of the session resumption state.

Only sent if BidiGenerateContentSetup.session_resumption was set.

Fields
new_handle	
string

New handle that represents state that can be resumed. Empty if resumable=false.

resumable	
bool

True if session can be resumed at this point.

It might be not possible to resume session at some points. In that case we send update empty new_handle and resumable=false. Example of such case could be model executing function calls or just generating. Resuming session (using previous session token) in such state will result in some data loss.

last_consumed_client_message_index	
int64

Index of last message sent by client that is included in state represented by this SessionResumptionToken. Only sent when SessionResumptionConfig.transparent is set.

Presence of this index allows users to transparently reconnect and avoid issue of losing some part of realtime audio input/video. If client wishes to temporarily disconnect (for example as result of receiving GoAway) they can do it without losing state by buffering messages sent since last SessionResmumptionTokenUpdate. This field will enable them to limit buffering (avoid keeping all requests in RAM).

It will not be used for 'resumption to restore state' some time later -- in those cases partial audio and video frames are likely not needed.

SharePointSources
The SharePointSources to pass to ImportRagFiles.

Fields
share_point_sources[]	
SharePointSource

The SharePoint sources.

SharePointSource
An individual SharePointSource.

Fields
client_id	
string

The Application ID for the app registered in Microsoft Azure Portal. The application must also be configured with MS Graph permissions "Files.ReadAll", "Sites.ReadAll" and BrowserSiteLists.Read.All.

client_secret	
ApiKeyConfig

The application secret for the app registered in Azure.

tenant_id	
string

Unique identifier of the Azure Active Directory Instance.

sharepoint_site_name	
string

The name of the SharePoint site to download from. This can be the site name or the site id.

file_id	
string

Output only. The SharePoint file id. Output only.

Union field folder_source. The SharePoint folder source. If not provided, uses "root". folder_source can be only one of the following:
sharepoint_folder_path	
string

The path of the SharePoint folder to download from.

sharepoint_folder_id	
string

The ID of the SharePoint folder to download from.

Union field drive_source. The SharePoint drive source. drive_source can be only one of the following:
drive_name	
string

The name of the drive to download from.

drive_id	
string

The ID of the drive to download from.

SlackSource
The Slack source for the ImportRagFilesRequest.

Fields
channels[]	
SlackChannels

Required. The Slack channels.

SlackChannels
SlackChannels contains the Slack channels and corresponding access token.

Fields
channels[]	
SlackChannel

Required. The Slack channel IDs.

api_key_config	
ApiKeyConfig

Required. The SecretManager secret version resource name (e.g. projects/{project}/secrets/{secret}/versions/{version}) storing the Slack channel access token that has access to the slack channel IDs. See: https://api.slack.com/tutorials/tracks/getting-a-token.

SlackChannel
SlackChannel contains the Slack channel ID and the time range to import.

Fields
channel_id	
string

Required. The Slack channel ID.

start_time	
Timestamp

Optional. The starting timestamp for messages to import.

end_time	
Timestamp

Optional. The ending timestamp for messages to import.

SpeakerVoiceConfig
Configuration for a single speaker in a multi-speaker setup.

Fields
speaker	
string

Required. The name of the speaker. This should be the same as the speaker name used in the prompt.

voice_config	
VoiceConfig

Required. The configuration for the voice of this speaker.

SpeechConfig
Configuration for speech generation.

Fields
voice_config	
VoiceConfig

The configuration for the voice to use.

language_code	
string

Optional. The language code (ISO 639-1) for the speech synthesis.

multi_speaker_voice_config	
MultiSpeakerVoiceConfig

The configuration for a multi-speaker text-to-speech request. This field is mutually exclusive with voice_config.

StreamDirectPredictRequest
Request message for PredictionService.StreamDirectPredict.

The first message must contain endpoint field and optionally [input][]. The subsequent messages must contain [input][].

Fields
endpoint	
string

Required. The name of the Endpoint requested to serve the prediction. Format: projects/{project}/locations/{location}/endpoints/{endpoint}

inputs[]	
Tensor

Optional. The prediction input.

parameters	
Tensor

Optional. The parameters that govern the prediction.

StreamDirectPredictResponse
Response message for PredictionService.StreamDirectPredict.

Fields
outputs[]	
Tensor

The prediction output.

parameters	
Tensor

The parameters that govern the prediction.

StreamDirectRawPredictRequest
Request message for PredictionService.StreamDirectRawPredict.

The first message must contain endpoint and method_name fields and optionally input. The subsequent messages must contain input. method_name in the subsequent messages have no effect.

Fields
endpoint	
string

Required. The name of the Endpoint requested to serve the prediction. Format: projects/{project}/locations/{location}/endpoints/{endpoint}

method_name	
string

Optional. Fully qualified name of the API method being invoked to perform predictions.

Format: /namespace.Service/Method/ Example: /tensorflow.serving.PredictionService/Predict

input	
bytes

Optional. The prediction input.

StreamDirectRawPredictResponse
Response message for PredictionService.StreamDirectRawPredict.

Fields
output	
bytes

The prediction output.

StreamQueryReasoningEngineRequest
Request message for [ReasoningEngineExecutionService.StreamQuery][].

Fields
name	
string

Required. The name of the ReasoningEngine resource to use. Format: projects/{project}/locations/{location}/reasoningEngines/{reasoning_engine}

input	
Struct

Optional. Input content provided by users in JSON object format. Examples include text query, function calling parameters, media bytes, etc.

class_method	
string

Optional. Class method to be used for the stream query. It is optional and defaults to "stream_query" if unspecified.

StreamRawPredictRequest
Request message for PredictionService.StreamRawPredict.

Fields
endpoint	
string

Required. The name of the Endpoint requested to serve the prediction. Format: projects/{project}/locations/{location}/endpoints/{endpoint}

http_body	
HttpBody

The prediction input. Supports HTTP headers and arbitrary data payload.

StreamingPredictRequest
Request message for PredictionService.StreamingPredict.

The first message must contain endpoint field and optionally [input][]. The subsequent messages must contain [input][].

Fields
endpoint	
string

Required. The name of the Endpoint requested to serve the prediction. Format: projects/{project}/locations/{location}/endpoints/{endpoint}

inputs[]	
Tensor

The prediction input.

parameters	
Tensor

The parameters that govern the prediction.

StreamingPredictResponse
Response message for PredictionService.StreamingPredict.

Fields
outputs[]	
Tensor

The prediction output.

parameters	
Tensor

The parameters that govern the prediction.

StreamingRawPredictRequest
Request message for PredictionService.StreamingRawPredict.

The first message must contain endpoint and method_name fields and optionally input. The subsequent messages must contain input. method_name in the subsequent messages have no effect.

Fields
endpoint	
string

Required. The name of the Endpoint requested to serve the prediction. Format: projects/{project}/locations/{location}/endpoints/{endpoint}

method_name	
string

Fully qualified name of the API method being invoked to perform predictions.

Format: /namespace.Service/Method/ Example: /tensorflow.serving.PredictionService/Predict

input	
bytes

The prediction input.

StreamingRawPredictResponse
Response message for PredictionService.StreamingRawPredict.

Fields
output	
bytes

The prediction output.

SummarizationHelpfulnessInput
Input for summarization helpfulness metric.

Fields
metric_spec	
SummarizationHelpfulnessSpec

Required. Spec for summarization helpfulness score metric.

instance	
SummarizationHelpfulnessInstance

Required. Summarization helpfulness instance.

SummarizationHelpfulnessInstance
Spec for summarization helpfulness instance.

Fields
prediction	
string

Required. Output of the evaluated model.

reference	
string

Optional. Ground truth used to compare against the prediction.

context	
string

Required. Text to be summarized.

instruction	
string

Optional. Summarization prompt for LLM.

SummarizationHelpfulnessResult
Spec for summarization helpfulness result.

Fields
explanation	
string

Output only. Explanation for summarization helpfulness score.

score	
float

Output only. Summarization Helpfulness score.

confidence	
float

Output only. Confidence for summarization helpfulness score.

SummarizationHelpfulnessSpec
Spec for summarization helpfulness score metric.

Fields
use_reference	
bool

Optional. Whether to use instance.reference to compute summarization helpfulness.

version	
int32

Optional. Which version to use for evaluation.

SummarizationQualityInput
Input for summarization quality metric.

Fields
metric_spec	
SummarizationQualitySpec

Required. Spec for summarization quality score metric.

instance	
SummarizationQualityInstance

Required. Summarization quality instance.

SummarizationQualityInstance
Spec for summarization quality instance.

Fields
prediction	
string

Required. Output of the evaluated model.

reference	
string

Optional. Ground truth used to compare against the prediction.

context	
string

Required. Text to be summarized.

instruction	
string

Required. Summarization prompt for LLM.

SummarizationQualityResult
Spec for summarization quality result.

Fields
explanation	
string

Output only. Explanation for summarization quality score.

score	
float

Output only. Summarization Quality score.

confidence	
float

Output only. Confidence for summarization quality score.

SummarizationQualitySpec
Spec for summarization quality score metric.

Fields
use_reference	
bool

Optional. Whether to use instance.reference to compute summarization quality.

version	
int32

Optional. Which version to use for evaluation.

SummarizationVerbosityInput
Input for summarization verbosity metric.

Fields
metric_spec	
SummarizationVerbositySpec

Required. Spec for summarization verbosity score metric.

instance	
SummarizationVerbosityInstance

Required. Summarization verbosity instance.

SummarizationVerbosityInstance
Spec for summarization verbosity instance.

Fields
prediction	
string

Required. Output of the evaluated model.

reference	
string

Optional. Ground truth used to compare against the prediction.

context	
string

Required. Text to be summarized.

instruction	
string

Optional. Summarization prompt for LLM.

SummarizationVerbosityResult
Spec for summarization verbosity result.

Fields
explanation	
string

Output only. Explanation for summarization verbosity score.

score	
float

Output only. Summarization Verbosity score.

confidence	
float

Output only. Confidence for summarization verbosity score.

SummarizationVerbositySpec
Spec for summarization verbosity score metric.

Fields
use_reference	
bool

Optional. Whether to use instance.reference to compute summarization verbosity.

version	
int32

Optional. Which version to use for evaluation.

SummaryMetrics
The summary metrics for the evaluation run.

Fields
metrics	
map<string, Value>

Optional. Map of metric name to metric value.

total_items	
int32

Optional. The total number of items that were evaluated.

failed_items	
int32

Optional. The number of items that failed to be evaluated.

SupervisedHyperParameters
Hyperparameters for SFT.

Fields
epoch_count	
int64

Optional. Number of complete passes the model makes over the entire training dataset during training.

learning_rate_multiplier	
double

Optional. Multiplier for adjusting the default learning rate. Mutually exclusive with learning_rate. This feature is only available for 1P models.

adapter_size	
AdapterSize

Optional. Adapter size for tuning.

AdapterSize
Supported adapter sizes for tuning.

Enums
ADAPTER_SIZE_UNSPECIFIED	Adapter size is unspecified.
ADAPTER_SIZE_ONE	Adapter size 1.
ADAPTER_SIZE_TWO	Adapter size 2.
ADAPTER_SIZE_FOUR	Adapter size 4.
ADAPTER_SIZE_EIGHT	Adapter size 8.
ADAPTER_SIZE_SIXTEEN	Adapter size 16.
ADAPTER_SIZE_THIRTY_TWO	Adapter size 32.
SupervisedTuningDataStats
Tuning data statistics for Supervised Tuning.

Fields
tuning_dataset_example_count	
int64

Output only. Number of examples in the tuning dataset.

total_tuning_character_count	
int64

Output only. Number of tuning characters in the tuning dataset.

total_billable_character_count
(deprecated)	
int64

This item is deprecated!

Output only. Number of billable characters in the tuning dataset.

total_billable_token_count	
int64

Output only. Number of billable tokens in the tuning dataset.

tuning_step_count	
int64

Output only. Number of tuning steps for this Tuning Job.

user_input_token_distribution	
SupervisedTuningDatasetDistribution

Output only. Dataset distributions for the user input tokens.

user_output_token_distribution	
SupervisedTuningDatasetDistribution

Output only. Dataset distributions for the user output tokens.

user_message_per_example_distribution	
SupervisedTuningDatasetDistribution

Output only. Dataset distributions for the messages per example.

user_dataset_examples[]	
Content

Output only. Sample user messages in the training dataset uri.

total_truncated_example_count	
int64

Output only. The number of examples in the dataset that have been dropped. An example can be dropped for reasons including: too many tokens, contains an invalid image, contains too many images, etc.

truncated_example_indices[]	
int64

Output only. A partial sample of the indices (starting from 1) of the dropped examples.

dropped_example_reasons[]	
string

Output only. For each index in truncated_example_indices, the user-facing reason why the example was dropped.

SupervisedTuningDatasetDistribution
Dataset distribution for Supervised Tuning.

Fields
sum	
int64

Output only. Sum of a given population of values.

billable_sum	
int64

Output only. Sum of a given population of values that are billable.

min	
double

Output only. The minimum of the population values.

max	
double

Output only. The maximum of the population values.

mean	
double

Output only. The arithmetic mean of the values in the population.

median	
double

Output only. The median of the values in the population.

p5	
double

Output only. The 5th percentile of the values in the population.

p95	
double

Output only. The 95th percentile of the values in the population.

buckets[]	
DatasetBucket

Output only. Defines the histogram bucket.

DatasetBucket
Dataset bucket used to create a histogram for the distribution given a population of values.

Fields
count	
double

Output only. Number of values in the bucket.

left	
double

Output only. Left bound of the bucket.

right	
double

Output only. Right bound of the bucket.

SupervisedTuningSpec
Tuning Spec for Supervised Tuning for first party models.

Fields
training_dataset_uri	
string

Required. Training dataset used for tuning. The dataset can be specified as either a Cloud Storage path to a JSONL file or as the resource name of a Vertex Multimodal Dataset.

validation_dataset_uri	
string

Optional. Validation dataset used for tuning. The dataset can be specified as either a Cloud Storage path to a JSONL file or as the resource name of a Vertex Multimodal Dataset.

hyper_parameters	
SupervisedHyperParameters

Optional. Hyperparameters for SFT.

export_last_checkpoint_only	
bool

Optional. If set to true, disable intermediate checkpoints for SFT and only the last checkpoint will be exported. Otherwise, enable intermediate checkpoints for SFT. Default is false.

SyntheticExample
Represents a single synthetic example, composed of multiple fields. Used for providing few-shot examples in the request and for returning generated examples in the response.

Fields
fields[]	
SyntheticField

Required. A list of fields that constitute an example.

SyntheticField
Represents a single named field within a SyntheticExample.

Fields
field_name	
string

Optional. The name of the field.

content	
Content

Required. The content of the field.

TaskDescriptionStrategy
Defines a generation strategy based on a high-level task description.

Fields
task_description	
string

Required. A high-level description of the synthetic data to be generated.

Tensor
A tensor value type.

Fields
dtype	
DataType

The data type of tensor.

shape[]	
int64

Shape of the tensor.

bool_val[]	
bool

Type specific representations that make it easy to create tensor protos in all languages. Only the representation corresponding to "dtype" can be set. The values hold the flattened representation of the tensor in row major order.

BOOL

string_val[]	
string

STRING

bytes_val[]	
bytes

STRING

float_val[]	
float

FLOAT

double_val[]	
double

DOUBLE

int_val[]	
int32

INT_8 INT_16 INT_32

int64_val[]	
int64

INT64

uint_val[]	
uint32

UINT8 UINT16 UINT32

uint64_val[]	
uint64

UINT64

list_val[]	
Tensor

A list of tensor values.

struct_val	
map<string, Tensor>

A map of string to tensor.

tensor_val	
bytes

Serialized raw tensor content.

DataType
Data type of the tensor.

Enums
DATA_TYPE_UNSPECIFIED	Not a legal value for DataType. Used to indicate a DataType field has not been set.
BOOL	Data types that all computation devices are expected to be capable to support.
STRING	
FLOAT	
DOUBLE	
INT8	
INT16	
INT32	
INT64	
UINT8	
UINT16	
UINT32	
UINT64	
TokensInfo
Tokens info with a list of tokens and the corresponding list of token ids.

Fields
tokens[]	
bytes

A list of tokens from the input.

token_ids[]	
int64

A list of token ids from the input.

role	
string

Optional. Optional fields for the role from the corresponding Content.

Tool
Tool details that the model may use to generate response.

A Tool is a piece of code that enables the system to interact with external systems to perform an action, or set of actions, outside of knowledge and scope of the model. A Tool object should contain exactly one type of Tool (e.g FunctionDeclaration, Retrieval or GoogleSearchRetrieval).

Fields
function_declarations[]	
FunctionDeclaration

Optional. Function tool type. One or more function declarations to be passed to the model along with the current user query. Model may decide to call a subset of these functions by populating FunctionCall in the response. User should provide a FunctionResponse for each function call in the next turn. Based on the function responses, Model will generate the final response back to the user. Maximum 512 function declarations can be provided.

retrieval	
Retrieval

Optional. Retrieval tool type. System will always execute the provided retrieval tool(s) to get external knowledge to answer the prompt. Retrieval results are presented to the model for generation.

google_search	
GoogleSearch

Optional. GoogleSearch tool type. Tool to support Google Search in Model. Powered by Google.

google_search_retrieval
(deprecated)	
GoogleSearchRetrieval

Optional. The google_search_retrieval field is deprecated. Use google_search instead. This field is for use with Gemini 1.5 models; google_search is used for Gemini 2.0 and newer models.

Optional. Specialized retrieval tool that is powered by Google Search.

google_maps	
GoogleMaps

Optional. GoogleMaps tool type. Tool to support Google Maps in Model.

enterprise_web_search	
EnterpriseWebSearch

Optional. Tool to support searching public web data, powered by Vertex AI Search and Sec4 compliance.

code_execution	
CodeExecution

Optional. CodeExecution tool type. Enables the model to execute code as part of generation.

url_context	
UrlContext

Optional. Tool to support URL context retrieval.

computer_use	
ComputerUse

Optional. Tool to support the model interacting directly with the computer. If enabled, it automatically populates computer-use specific Function Declarations.

CodeExecution
This type has no fields.

Tool that executes code generated by the model, and automatically returns the result to the model.

See also [ExecutableCode]and [CodeExecutionResult] which are input and output to this tool.

ComputerUse
Tool to support computer use.

Fields
environment	
Environment

Required. The environment being operated.

excluded_predefined_functions[]	
string

Optional. By default, predefined functions are included in the final model call. Some of them can be explicitly excluded from being automatically included. This can serve two purposes: 1. Using a more restricted / different action space. 2. Improving the definitions / instructions of predefined functions.

Environment
Represents the environment being operated, such as a web browser.

Enums
ENVIRONMENT_UNSPECIFIED	Defaults to browser.
ENVIRONMENT_BROWSER	Operates in a web browser.
GoogleSearch
GoogleSearch tool type. Tool to support Google Search in Model. Powered by Google.

Fields
exclude_domains[]	
string

Optional. List of domains to be excluded from the search results. The default limit is 2000 domains. Example: ["amazon.com", "facebook.com"].

blocking_confidence	
PhishBlockThreshold

Optional. Sites with confidence level chosen & above this value will be blocked from the search results.

PhishBlockThreshold
These are available confidence level user can set to block malicious urls with chosen confidence and above. For understanding different confidence of webrisk, please refer to https://cloud.google.com/web-risk/docs/reference/rpc/google.cloud.webrisk.v1eap1#confidencelevel

Enums
PHISH_BLOCK_THRESHOLD_UNSPECIFIED	Defaults to unspecified.
BLOCK_LOW_AND_ABOVE	Blocks Low and above confidence URL that is risky.
BLOCK_MEDIUM_AND_ABOVE	Blocks Medium and above confidence URL that is risky.
BLOCK_HIGH_AND_ABOVE	Blocks High and above confidence URL that is risky.
BLOCK_HIGHER_AND_ABOVE	Blocks Higher and above confidence URL that is risky.
BLOCK_VERY_HIGH_AND_ABOVE	Blocks Very high and above confidence URL that is risky.
BLOCK_ONLY_EXTREMELY_HIGH	Blocks Extremely high confidence URL that is risky.
ToolCall
Spec for tool call.

Fields
tool_name	
string

Required. Spec for tool name

tool_input	
string

Optional. Spec for tool input

ToolCallValidInput
Input for tool call valid metric.

Fields
metric_spec	
ToolCallValidSpec

Required. Spec for tool call valid metric.

instances[]	
ToolCallValidInstance

Required. Repeated tool call valid instances.

ToolCallValidInstance
Spec for tool call valid instance.

Fields
prediction	
string

Required. Output of the evaluated model.

reference	
string

Required. Ground truth used to compare against the prediction.

ToolCallValidMetricValue
Tool call valid metric value for an instance.

Fields
score	
float

Output only. Tool call valid score.

ToolCallValidResults
Results for tool call valid metric.

Fields
tool_call_valid_metric_values[]	
ToolCallValidMetricValue

Output only. Tool call valid metric values.

ToolCallValidSpec
This type has no fields.

Spec for tool call valid metric.

ToolConfig
Tool config. This config is shared for all tools provided in the request.

Fields
function_calling_config	
FunctionCallingConfig

Optional. Function calling config.

retrieval_config	
RetrievalConfig

Optional. Retrieval config.

ToolNameMatchInput
Input for tool name match metric.

Fields
metric_spec	
ToolNameMatchSpec

Required. Spec for tool name match metric.

instances[]	
ToolNameMatchInstance

Required. Repeated tool name match instances.

ToolNameMatchInstance
Spec for tool name match instance.

Fields
prediction	
string

Required. Output of the evaluated model.

reference	
string

Required. Ground truth used to compare against the prediction.

ToolNameMatchMetricValue
Tool name match metric value for an instance.

Fields
score	
float

Output only. Tool name match score.

ToolNameMatchResults
Results for tool name match metric.

Fields
tool_name_match_metric_values[]	
ToolNameMatchMetricValue

Output only. Tool name match metric values.

ToolNameMatchSpec
This type has no fields.

Spec for tool name match metric.

ToolParameterKVMatchInput
Input for tool parameter key value match metric.

Fields
metric_spec	
ToolParameterKVMatchSpec

Required. Spec for tool parameter key value match metric.

instances[]	
ToolParameterKVMatchInstance

Required. Repeated tool parameter key value match instances.

ToolParameterKVMatchInstance
Spec for tool parameter key value match instance.

Fields
prediction	
string

Required. Output of the evaluated model.

reference	
string

Required. Ground truth used to compare against the prediction.

ToolParameterKVMatchMetricValue
Tool parameter key value match metric value for an instance.

Fields
score	
float

Output only. Tool parameter key value match score.

ToolParameterKVMatchResults
Results for tool parameter key value match metric.

Fields
tool_parameter_kv_match_metric_values[]	
ToolParameterKVMatchMetricValue

Output only. Tool parameter key value match metric values.

ToolParameterKVMatchSpec
Spec for tool parameter key value match metric.

Fields
use_strict_string_match	
bool

Optional. Whether to use STRICT string match on parameter values.

ToolParameterKeyMatchInput
Input for tool parameter key match metric.

Fields
metric_spec	
ToolParameterKeyMatchSpec

Required. Spec for tool parameter key match metric.

instances[]	
ToolParameterKeyMatchInstance

Required. Repeated tool parameter key match instances.

ToolParameterKeyMatchInstance
Spec for tool parameter key match instance.

Fields
prediction	
string

Required. Output of the evaluated model.

reference	
string

Required. Ground truth used to compare against the prediction.

ToolParameterKeyMatchMetricValue
Tool parameter key match metric value for an instance.

Fields
score	
float

Output only. Tool parameter key match score.

ToolParameterKeyMatchResults
Results for tool parameter key match metric.

Fields
tool_parameter_key_match_metric_values[]	
ToolParameterKeyMatchMetricValue

Output only. Tool parameter key match metric values.

ToolParameterKeyMatchSpec
This type has no fields.

Spec for tool parameter key match metric.

Trajectory
Spec for trajectory.

Fields
tool_calls[]	
ToolCall

Required. Tool calls in the trajectory.

TrajectoryAnyOrderMatchInput
Instances and metric spec for TrajectoryAnyOrderMatch metric.

Fields
metric_spec	
TrajectoryAnyOrderMatchSpec

Required. Spec for TrajectoryAnyOrderMatch metric.

instances[]	
TrajectoryAnyOrderMatchInstance

Required. Repeated TrajectoryAnyOrderMatch instance.

TrajectoryAnyOrderMatchInstance
Spec for TrajectoryAnyOrderMatch instance.

Fields
predicted_trajectory	
Trajectory

Required. Spec for predicted tool call trajectory.

reference_trajectory	
Trajectory

Required. Spec for reference tool call trajectory.

TrajectoryAnyOrderMatchMetricValue
TrajectoryAnyOrderMatch metric value for an instance.

Fields
score	
float

Output only. TrajectoryAnyOrderMatch score.

TrajectoryAnyOrderMatchResults
Results for TrajectoryAnyOrderMatch metric.

Fields
trajectory_any_order_match_metric_values[]	
TrajectoryAnyOrderMatchMetricValue

Output only. TrajectoryAnyOrderMatch metric values.

TrajectoryAnyOrderMatchSpec
This type has no fields.

Spec for TrajectoryAnyOrderMatch metric - returns 1 if all tool calls in the reference trajectory appear in the predicted trajectory in any order, else 0.

TrajectoryExactMatchInput
Instances and metric spec for TrajectoryExactMatch metric.

Fields
metric_spec	
TrajectoryExactMatchSpec

Required. Spec for TrajectoryExactMatch metric.

instances[]	
TrajectoryExactMatchInstance

Required. Repeated TrajectoryExactMatch instance.

TrajectoryExactMatchInstance
Spec for TrajectoryExactMatch instance.

Fields
predicted_trajectory	
Trajectory

Required. Spec for predicted tool call trajectory.

reference_trajectory	
Trajectory

Required. Spec for reference tool call trajectory.

TrajectoryExactMatchMetricValue
TrajectoryExactMatch metric value for an instance.

Fields
score	
float

Output only. TrajectoryExactMatch score.

TrajectoryExactMatchResults
Results for TrajectoryExactMatch metric.

Fields
trajectory_exact_match_metric_values[]	
TrajectoryExactMatchMetricValue

Output only. TrajectoryExactMatch metric values.

TrajectoryExactMatchSpec
This type has no fields.

Spec for TrajectoryExactMatch metric - returns 1 if tool calls in the reference trajectory exactly match the predicted trajectory, else 0.

TrajectoryInOrderMatchInput
Instances and metric spec for TrajectoryInOrderMatch metric.

Fields
metric_spec	
TrajectoryInOrderMatchSpec

Required. Spec for TrajectoryInOrderMatch metric.

instances[]	
TrajectoryInOrderMatchInstance

Required. Repeated TrajectoryInOrderMatch instance.

TrajectoryInOrderMatchInstance
Spec for TrajectoryInOrderMatch instance.

Fields
predicted_trajectory	
Trajectory

Required. Spec for predicted tool call trajectory.

reference_trajectory	
Trajectory

Required. Spec for reference tool call trajectory.

TrajectoryInOrderMatchMetricValue
TrajectoryInOrderMatch metric value for an instance.

Fields
score	
float

Output only. TrajectoryInOrderMatch score.

TrajectoryInOrderMatchResults
Results for TrajectoryInOrderMatch metric.

Fields
trajectory_in_order_match_metric_values[]	
TrajectoryInOrderMatchMetricValue

Output only. TrajectoryInOrderMatch metric values.

TrajectoryInOrderMatchSpec
This type has no fields.

Spec for TrajectoryInOrderMatch metric - returns 1 if tool calls in the reference trajectory appear in the predicted trajectory in the same order, else 0.

TrajectoryPrecisionInput
Instances and metric spec for TrajectoryPrecision metric.

Fields
metric_spec	
TrajectoryPrecisionSpec

Required. Spec for TrajectoryPrecision metric.

instances[]	
TrajectoryPrecisionInstance

Required. Repeated TrajectoryPrecision instance.

TrajectoryPrecisionInstance
Spec for TrajectoryPrecision instance.

Fields
predicted_trajectory	
Trajectory

Required. Spec for predicted tool call trajectory.

reference_trajectory	
Trajectory

Required. Spec for reference tool call trajectory.

TrajectoryPrecisionMetricValue
TrajectoryPrecision metric value for an instance.

Fields
score	
float

Output only. TrajectoryPrecision score.

TrajectoryPrecisionResults
Results for TrajectoryPrecision metric.

Fields
trajectory_precision_metric_values[]	
TrajectoryPrecisionMetricValue

Output only. TrajectoryPrecision metric values.

TrajectoryPrecisionSpec
This type has no fields.

Spec for TrajectoryPrecision metric - returns a float score based on average precision of individual tool calls.

TrajectoryRecallInput
Instances and metric spec for TrajectoryRecall metric.

Fields
metric_spec	
TrajectoryRecallSpec

Required. Spec for TrajectoryRecall metric.

instances[]	
TrajectoryRecallInstance

Required. Repeated TrajectoryRecall instance.

TrajectoryRecallInstance
Spec for TrajectoryRecall instance.

Fields
predicted_trajectory	
Trajectory

Required. Spec for predicted tool call trajectory.

reference_trajectory	
Trajectory

Required. Spec for reference tool call trajectory.

TrajectoryRecallMetricValue
TrajectoryRecall metric value for an instance.

Fields
score	
float

Output only. TrajectoryRecall score.

TrajectoryRecallResults
Results for TrajectoryRecall metric.

Fields
trajectory_recall_metric_values[]	
TrajectoryRecallMetricValue

Output only. TrajectoryRecall metric values.

TrajectoryRecallSpec
This type has no fields.

Spec for TrajectoryRecall metric - returns a float score based on average recall of individual tool calls.

TrajectorySingleToolUseInput
Instances and metric spec for TrajectorySingleToolUse metric.

Fields
metric_spec	
TrajectorySingleToolUseSpec

Required. Spec for TrajectorySingleToolUse metric.

instances[]	
TrajectorySingleToolUseInstance

Required. Repeated TrajectorySingleToolUse instance.

TrajectorySingleToolUseInstance
Spec for TrajectorySingleToolUse instance.

Fields
predicted_trajectory	
Trajectory

Required. Spec for predicted tool call trajectory.

TrajectorySingleToolUseMetricValue
TrajectorySingleToolUse metric value for an instance.

Fields
score	
float

Output only. TrajectorySingleToolUse score.

TrajectorySingleToolUseResults
Results for TrajectorySingleToolUse metric.

Fields
trajectory_single_tool_use_metric_values[]	
TrajectorySingleToolUseMetricValue

Output only. TrajectorySingleToolUse metric values.

TrajectorySingleToolUseSpec
Spec for TrajectorySingleToolUse metric - returns 1 if tool is present in the predicted trajectory, else 0.

Fields
tool_name	
string

Required. Spec for tool name to be checked for in the predicted trajectory.

TunedModel
The Model Registry Model and Online Prediction Endpoint associated with this TuningJob.

Fields
model	
string

Output only. The resource name of the TunedModel. Format:

projects/{project}/locations/{location}/models/{model}@{version_id}

When tuning from a base model, the version ID will be 1.

For continuous tuning, if the provided tuned_model_display_name is set and different from parent model's display name, the tuned model will have a new parent model with version 1. Otherwise the version id will be incremented by 1 from the last version ID in the parent model. E.g.,

projects/{project}/locations/{location}/models/{model}@{last_version_id + 1}

endpoint	
string

Output only. A resource name of an Endpoint. Format: projects/{project}/locations/{location}/endpoints/{endpoint}.

checkpoints[]	
TunedModelCheckpoint

Output only. The checkpoints associated with this TunedModel. This field is only populated for tuning jobs that enable intermediate checkpoints.

TunedModelCheckpoint
TunedModelCheckpoint for the Tuned Model of a Tuning Job.

Fields
checkpoint_id	
string

The ID of the checkpoint.

epoch	
int64

The epoch of the checkpoint.

step	
int64

The step of the checkpoint.

endpoint	
string

The Endpoint resource name that the checkpoint is deployed to. Format: projects/{project}/locations/{location}/endpoints/{endpoint}.

TunedModelRef
TunedModel Reference for legacy model migration.

Fields
Union field tuned_model_ref. The Tuned Model Reference for the model. tuned_model_ref can be only one of the following:
tuned_model	
string

Support migration from model registry.

tuning_job	
string

Support migration from tuning job list page, from gemini-1.0-pro-002 to 1.5 and above.

pipeline_job	
string

Support migration from tuning job list page, from bison model to gemini model.

TuningDataStats
The tuning data statistic values for TuningJob.

Fields
Union field tuning_data_stats.

tuning_data_stats can be only one of the following:

supervised_tuning_data_stats	
SupervisedTuningDataStats

The SFT Tuning data stats.

preference_optimization_data_stats	
PreferenceOptimizationDataStats

Output only. Statistics for preference optimization.

TuningJob
Represents a TuningJob that runs with Google owned models.

Fields
name	
string

Output only. Identifier. Resource name of a TuningJob. Format: projects/{project}/locations/{location}/tuningJobs/{tuning_job}

tuned_model_display_name	
string

Optional. The display name of the TunedModel. The name can be up to 128 characters long and can consist of any UTF-8 characters. For continuous tuning, tuned_model_display_name will by default use the same display name as the pre-tuned model. If a new display name is provided, the tuning job will create a new model instead of a new version.

description	
string

Optional. The description of the TuningJob.

state	
JobState

Output only. The detailed state of the job.

create_time	
Timestamp

Output only. Time when the TuningJob was created.

start_time	
Timestamp

Output only. Time when the TuningJob for the first time entered the JOB_STATE_RUNNING state.

end_time	
Timestamp

Output only. Time when the TuningJob entered any of the following JobStates: JOB_STATE_SUCCEEDED, JOB_STATE_FAILED, JOB_STATE_CANCELLED, JOB_STATE_EXPIRED.

update_time	
Timestamp

Output only. Time when the TuningJob was most recently updated.

error	
Status

Output only. Only populated when job's state is JOB_STATE_FAILED or JOB_STATE_CANCELLED.

labels	
map<string, string>

Optional. The labels with user-defined metadata to organize TuningJob and generated resources such as Model and Endpoint.

Label keys and values can be no longer than 64 characters (Unicode codepoints), can only contain lowercase letters, numeric characters, underscores and dashes. International characters are allowed.

See https://goo.gl/xmQnxf for more information and examples of labels.

experiment	
string

Output only. The Experiment associated with this TuningJob.

tuned_model	
TunedModel

Output only. The tuned model resources associated with this TuningJob.

tuning_data_stats	
TuningDataStats

Output only. The tuning data statistics associated with this TuningJob.

encryption_spec	
EncryptionSpec

Customer-managed encryption key options for a TuningJob. If this is set, then all resources created by the TuningJob will be encrypted with the provided encryption key.

service_account	
string

The service account that the tuningJob workload runs as. If not specified, the Vertex AI Secure Fine-Tuned Service Agent in the project will be used. See https://cloud.google.com/iam/docs/service-agents#vertex-ai-secure-fine-tuning-service-agent

Users starting the pipeline must have the iam.serviceAccounts.actAs permission on this service account.

Union field source_model.

source_model can be only one of the following:

base_model	
string

The base model that is being tuned. See Supported models.

pre_tuned_model	
PreTunedModel

The pre-tuned model for continuous tuning.

Union field tuning_spec.

tuning_spec can be only one of the following:

supervised_tuning_spec	
SupervisedTuningSpec

Tuning Spec for Supervised Fine Tuning.

preference_optimization_spec	
PreferenceOptimizationSpec

Tuning Spec for Preference Optimization.

Type
Type contains the list of OpenAPI data types as defined by https://swagger.io/docs/specification/data-models/data-types/

Enums
TYPE_UNSPECIFIED	Not specified, should not be used.
STRING	OpenAPI string type
NUMBER	OpenAPI number type
INTEGER	OpenAPI integer type
BOOLEAN	OpenAPI boolean type
ARRAY	OpenAPI array type
OBJECT	OpenAPI object type
NULL	Null type
UpdateCacheConfigOperationMetadata
Runtime operation information for GenAiCacheConfigService.UpdateCacheConfig.

Fields
generic_metadata	
GenericOperationMetadata

The operation generic information.

UpdateCacheConfigRequest
Request message for updating a cache config.

Fields
cache_config	
CacheConfig

Required. The cache config to be updated. cache_config.name is used to identify the cache config. Format: - projects/{project}/cacheConfig.

UpdateCachedContentRequest
Request message for GenAiCacheService.UpdateCachedContent. Only expire_time or ttl can be updated.

Fields
cached_content	
CachedContent

Required. The cached content to update

update_mask	
FieldMask

Required. The list of fields to update.

UpdateEvaluationSetRequest
Request message for EvaluationManagementService.UpdateEvaluationSet.

Fields
evaluation_set	
EvaluationSet

Required. The EvaluationSet to update.

The EvaluationSet's name field is used to identify the EvaluationSet to update. Format: projects/{project}/locations/{location}/evaluationSets/{evaluation_set}

update_mask	
FieldMask

Optional. The update mask applies to the resource. For the FieldMask definition, see google.protobuf.FieldMask.

UpdateRagCorpusOperationMetadata
Runtime operation information for VertexRagDataService.UpdateRagCorpus.

Fields
generic_metadata	
GenericOperationMetadata

The operation generic information.

UpdateRagCorpusRequest
Request message for VertexRagDataService.UpdateRagCorpus.

Fields
rag_corpus	
RagCorpus

Required. The RagCorpus which replaces the resource on the server.

UpdateRagEngineConfigOperationMetadata
Runtime operation information for VertexRagDataService.UpdateRagEngineConfig.

Fields
generic_metadata	
GenericOperationMetadata

The operation generic information.

UpdateRagEngineConfigRequest
Request message for VertexRagDataService.UpdateRagEngineConfig.

Fields
rag_engine_config	
RagEngineConfig

Required. The updated RagEngineConfig.

NOTE: Downgrading your RagManagedDb's ComputeTier could temporarily increase request latencies until the operation is fully complete.

UpdateReasoningEngineOperationMetadata
Details of ReasoningEngineService.UpdateReasoningEngine operation.

Fields
generic_metadata	
GenericOperationMetadata

The common part of the operation metadata.

UpdateReasoningEngineRequest
Request message for ReasoningEngineService.UpdateReasoningEngine.

Fields
reasoning_engine	
ReasoningEngine

Required. The ReasoningEngine which replaces the resource on the server.

update_mask	
FieldMask

Optional. Mask specifying which fields to update.

UploadRagFileConfig
Config for uploading RagFile.

Fields
rag_file_transformation_config	
RagFileTransformationConfig

Specifies the transformation config for RagFiles.

UrlContext
This type has no fields.

Tool to support URL context.

UrlContextMetadata
Metadata returned when the model uses the url_context tool to get information from a user-provided URL.

Fields
url_metadata[]	
UrlMetadata

Output only. A list of URL metadata, with one entry for each URL retrieved by the tool.

UrlMetadata
The metadata for a single URL retrieval.

Fields
retrieved_url	
string

The URL retrieved by the tool.

url_retrieval_status	
UrlRetrievalStatus

The status of the URL retrieval.

UrlRetrievalStatus
The status of a URL retrieval.

Enums
URL_RETRIEVAL_STATUS_UNSPECIFIED	Default value. This value is unused.
URL_RETRIEVAL_STATUS_SUCCESS	The URL was retrieved successfully.
URL_RETRIEVAL_STATUS_ERROR	The URL retrieval failed.
UsageMetadata
Usage metadata about the content generation request and response. This message provides a detailed breakdown of token usage and other relevant metrics.

Fields
prompt_token_count	
int32

The total number of tokens in the prompt. This includes any text, images, or other media provided in the request. When cached_content is set, this also includes the number of tokens in the cached content.

candidates_token_count	
int32

The total number of tokens in the generated candidates.

total_token_count	
int32

The total number of tokens for the entire request. This is the sum of prompt_token_count, candidates_token_count, tool_use_prompt_token_count, and thoughts_token_count.

tool_use_prompt_token_count	
int32

Output only. The number of tokens in the results from tool executions, which are provided back to the model as input, if applicable.

thoughts_token_count	
int32

Output only. The number of tokens that were part of the model's generated "thoughts" output, if applicable.

cached_content_token_count	
int32

Output only. The number of tokens in the cached content that was used for this request.

prompt_tokens_details[]	
ModalityTokenCount

Output only. A detailed breakdown of the token count for each modality in the prompt.

cache_tokens_details[]	
ModalityTokenCount

Output only. A detailed breakdown of the token count for each modality in the cached content.

candidates_tokens_details[]	
ModalityTokenCount

Output only. A detailed breakdown of the token count for each modality in the generated candidates.

tool_use_prompt_tokens_details[]	
ModalityTokenCount

Output only. A detailed breakdown by modality of the token counts from the results of tool executions, which are provided back to the model as input.

traffic_type	
TrafficType

Output only. The traffic type for this request.

TrafficType
The type of traffic that this request was processed with, indicating which quota gets consumed.

Enums
TRAFFIC_TYPE_UNSPECIFIED	Unspecified request traffic type.
ON_DEMAND	Type for Pay-As-You-Go traffic.
PROVISIONED_THROUGHPUT	Type for Provisioned Throughput traffic.
VertexAISearch
Retrieve from Vertex AI Search datastore or engine for grounding. datastore and engine are mutually exclusive. See https://cloud.google.com/products/agent-builder

Fields
datastore	
string

Optional. Fully-qualified Vertex AI Search data store resource ID. Format: projects/{project}/locations/{location}/collections/{collection}/dataStores/{dataStore}

engine	
string

Optional. Fully-qualified Vertex AI Search engine resource ID. Format: projects/{project}/locations/{location}/collections/{collection}/engines/{engine}

max_results	
int32

Optional. Number of search results to return per query. The default value is 10. The maximumm allowed value is 10.

filter	
string

Optional. Filter strings to be passed to the search API.

data_store_specs[]	
DataStoreSpec

Specifications that define the specific DataStores to be searched, along with configurations for those data stores. This is only considered for Engines with multiple data stores. It should only be set if engine is used.

DataStoreSpec
Define data stores within engine to filter on in a search call and configurations for those data stores. For more information, see https://cloud.google.com/generative-ai-app-builder/docs/reference/rpc/google.cloud.discoveryengine.v1#datastorespec

Fields
data_store	
string

Full resource name of DataStore, such as Format: projects/{project}/locations/{location}/collections/{collection}/dataStores/{dataStore}

filter	
string

Optional. Filter specification to filter documents in the data store specified by data_store field. For more information on filtering, see Filtering

VertexAiSearchConfig
Config for the Vertex AI Search.

Fields
serving_config	
string

Vertex AI Search Serving Config resource full name. For example, projects/{project}/locations/{location}/collections/{collection}/engines/{engine}/servingConfigs/{serving_config} or projects/{project}/locations/{location}/collections/{collection}/dataStores/{data_store}/servingConfigs/{serving_config}.

VertexRagStore
Retrieve from Vertex RAG Store for grounding.

Fields
rag_resources[]	
RagResource

Optional. The representation of the rag source. It can be used to specify corpus only or ragfiles. Currently only support one corpus or multiple files from one corpus. In the future we may open up multiple corpora support.

rag_retrieval_config	
RagRetrievalConfig

Optional. The retrieval config for the Rag query.

similarity_top_k
(deprecated)	
int32

This item is deprecated!

Optional. Number of top k results to return from the selected corpora.

vector_distance_threshold
(deprecated)	
double

This item is deprecated!

Optional. Only return results with vector distance smaller than the threshold.

RagResource
The definition of the Rag resource.

Fields
rag_corpus	
string

Optional. RagCorpora resource name. Format: projects/{project}/locations/{location}/ragCorpora/{rag_corpus}

rag_file_ids[]	
string

Optional. rag_file_id. The files should be in the same rag_corpus set in rag_corpus field.

VideoMetadata
Provides metadata for a video, including the start and end offsets for clipping and the frame rate.

Fields
start_offset	
Duration

Optional. The start offset of the video.

end_offset	
Duration

Optional. The end offset of the video.

fps	
double

Optional. The frame rate of the video sent to the model. If not specified, the default value is 1.0. The valid range is (0.0, 24.0].

VoiceConfig
Configuration for a voice.

Fields
Union field voice_config. The configuration for the speaker to use. voice_config can be only one of the following:
prebuilt_voice_config	
PrebuiltVoiceConfig

The configuration for a prebuilt voice.

replicated_voice_config	
ReplicatedVoiceConfig

Optional. The configuration for a replicated voice. This enables users to replicate a voice from an audio sample.

Was this helpful?

Send feedback
Except as otherwise noted, the content of this page is licensed under the Creative Commons Attribution 4.0 License, and code samples are licensed under the Apache 2.0 License. For details, see the Google Developers Site Policies. Java is a registered trademark of Oracle and/or its affiliates.

Last updated 2025-11-18 UTC.

Products and pricing
See all products
Google Cloud pricing
Google Cloud Marketplace
Contact sales
Support
Community forums
Support
Release Notes
System status
Resources
GitHub
Getting Started with Google Cloud
Code samples
Cloud Architecture Center
Training and Certification
Engage
Blog
Events
X (Twitter)
Google Cloud on YouTube
Google Cloud Tech on YouTube
About Google
Privacy
Site terms
Google Cloud terms
Our third decade of climate action: join us
Sign up for the Google Cloud newsletter
Subscribe

English
The new page has loaded..
Explain         